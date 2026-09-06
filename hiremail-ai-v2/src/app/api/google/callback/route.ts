import { NextRequest, NextResponse } from "next/server";
import { sha256, encryptSecret } from "@/lib/crypto";
import { query } from "@/lib/db";
import { exchangeGoogleCode } from "@/services/gmail.service";

export async function GET(req: NextRequest) {
    const state = req.nextUrl.searchParams.get("state");
    const code = req.nextUrl.searchParams.get("code");

    if (!state || !code) {
        console.error("[GMAIL CALLBACK] Missing state or code");

        return NextResponse.redirect(
            new URL("/settings?gmail=error", req.url)
        );
    }

    try {
        // 1. Validate OAuth state
        const r = await query<{ user_id: string }>(
            `DELETE FROM oauth_states
       WHERE state_hash = $1
       AND expires_at > NOW()
       RETURNING user_id`,
            [sha256(state)]
        );

        const userId = r.rows[0]?.user_id;

        if (!userId) {
            console.error("[GMAIL CALLBACK] Invalid/expired OAuth state");

            return NextResponse.redirect(
                new URL("/settings?gmail=state", req.url)
            );
        }

        console.log("[GMAIL CALLBACK] OAuth state valid");

        // 2. Exchange Google authorization code
        const x = await exchangeGoogleCode(code);

        console.log("[GMAIL CALLBACK] Google code exchanged", {
            hasEmail: Boolean(x.email),
            hasRefreshToken: Boolean(x.refreshToken),
            hasScope: Boolean(x.scope),
        });

        if (!x.email) {
            console.error("[GMAIL CALLBACK] Google email missing");

            return NextResponse.redirect(
                new URL("/settings?gmail=noemail", req.url)
            );
        }

        let refresh = x.refreshToken;

        // 3. Google might not return a new refresh token
        if (!refresh) {
            console.log(
                "[GMAIL CALLBACK] No new refresh token. Checking existing connection."
            );

            const old = await query<{
                refresh_token_ciphertext: string;
                refresh_token_iv: string;
                refresh_token_tag: string;
            }>(
                `SELECT
          refresh_token_ciphertext,
          refresh_token_iv,
          refresh_token_tag
         FROM gmail_connections
         WHERE user_id = $1`,
                [userId]
            );

            if (!old.rows[0]) {
                console.error(
                    "[GMAIL CALLBACK] No refresh token and no existing Gmail connection"
                );

                return NextResponse.redirect(
                    new URL("/settings?gmail=notoken", req.url)
                );
            }

            console.log(
                "[GMAIL CALLBACK] Existing Gmail connection found"
            );

            return NextResponse.redirect(
                new URL("/settings?gmail=connected", req.url)
            );
        }

        // 4. Encrypt refresh token
        const enc = encryptSecret(refresh);

        console.log("[GMAIL CALLBACK] Refresh token encrypted");

        // 5. Save Gmail connection
        await query(
            `INSERT INTO gmail_connections(
        user_id,
        gmail_email,
        refresh_token_ciphertext,
        refresh_token_iv,
        refresh_token_tag,
        scope
      )
      VALUES($1,$2,$3,$4,$5,$6)

      ON CONFLICT(user_id)
      DO UPDATE SET
        gmail_email = EXCLUDED.gmail_email,
        refresh_token_ciphertext = EXCLUDED.refresh_token_ciphertext,
        refresh_token_iv = EXCLUDED.refresh_token_iv,
        refresh_token_tag = EXCLUDED.refresh_token_tag,
        scope = EXCLUDED.scope,
        connected_at = NOW()`,
            [
                userId,
                x.email,
                enc.ciphertext,
                enc.iv,
                enc.tag,
                x.scope,
            ]
        );

        console.log("[GMAIL CALLBACK] Gmail connection saved successfully", {
            email: x.email,
        });

        return NextResponse.redirect(
            new URL("/settings?gmail=connected", req.url)
        );
    } catch (error) {
        console.error("[GMAIL CALLBACK ERROR]", error);

        return NextResponse.redirect(
            new URL("/settings?gmail=error", req.url)
        );
    }
}