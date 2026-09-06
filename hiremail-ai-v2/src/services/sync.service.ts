import { analyzeEmail } from "@/ai/engine";import { query } from "@/lib/db";import { emailExists,getFeedback,insertEmail } from "./email.repository";import { getParsedMessage,listMessageIds } from "./gmail.service";import { getUserFields } from "./user.repository";
export async function syncUser(userId:string){const runId=crypto.randomUUID();await query("INSERT INTO sync_runs(id,user_id) VALUES($1,$2)",[runId,userId]);let scanned=0,inserted=0,relevant=0;try{const fields=await getUserFields(userId);const selected=fields.length?fields:["ALL"];const feedback=await getFeedback(userId);const ids=await listMessageIds(userId,process.env.GMAIL_SYNC_QUERY||"newer_than:30d -in:spam -in:trash",Number(process.env.GMAIL_SYNC_MAX_RESULTS||"100"));for(const id of ids){scanned++;if(await emailExists(userId,id))continue;const m=await getParsedMessage(userId,id);const a=analyzeEmail({subject:m.subject,body:m.bodyText,senderName:m.senderName,senderEmail:m.senderEmail},selected,feedback);await insertEmail(userId,m,a);inserted++;if(a.isRelevant)relevant++;}await query("UPDATE sync_runs SET finished_at=NOW(),status='SUCCESS',scanned_count=$1,inserted_count=$2,relevant_count=$3 WHERE id=$4",[scanned,inserted,relevant,runId]);await query("UPDATE gmail_connections SET last_sync_at=NOW() WHERE user_id=$1",[userId]);return{scanned,inserted,relevant};}catch(e){await query("UPDATE sync_runs SET finished_at=NOW(),status='ERROR',scanned_count=$1,inserted_count=$2,relevant_count=$3,error_message=$4 WHERE id=$5",[scanned,inserted,relevant,e instanceof Error?e.message:String(e),runId]);throw e;}}
export async function syncAllConnectedUsers(){const r=await query<{user_id:string}>("SELECT user_id FROM gmail_connections");const results=[] as any[];for(const row of r.rows){try{results.push({userId:row.user_id,...await syncUser(row.user_id)});}catch(e){results.push({userId:row.user_id,error:e instanceof Error?e.message:String(e)});}}return results;}

export async function reanalyzeUserEmails(userId:string){
  const fields=await getUserFields(userId);
  const selected=fields.length?fields:["ALL"];
  const feedback=await getFeedback(userId);
  const rows=await query<{id:string;subject:string;body_text:string;sender_name:string|null;sender_email:string|null}>("SELECT id,subject,body_text,sender_name,sender_email FROM emails WHERE user_id=$1 ORDER BY received_at DESC LIMIT 1000",[userId]);
  let updated=0;
  for(const e of rows.rows){
    const a=analyzeEmail({subject:e.subject,body:e.body_text,senderName:e.sender_name,senderEmail:e.sender_email},selected,feedback);
    await query(`UPDATE emails SET is_relevant=$1,professional_score=$2,category=$3,category_score=$4,detected_field=$5,field_score=$6,company=$7,role_title=$8,opportunity_type=$9,required_action=$10,deadline=$11,summary=$12,analysis_reasons=$13,updated_at=NOW() WHERE id=$14 AND user_id=$15`,[a.isRelevant,a.professionalScore,a.category,a.categoryScore,a.detectedField,a.fieldScore,a.company,a.roleTitle,a.opportunityType,a.requiredAction,a.deadline,a.summary,JSON.stringify(a.reasons),e.id,userId]);
    updated++;
  }
  return {updated};
}
