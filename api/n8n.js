export async function sendAlertEmail(body){
    const res = await fetch('https://n8n-lyb.zeabur.app/webhook/b04e5c37-1b16-4527-a061-84dc46b05d62',{
        method: 'POST',
        body: JSON.stringify(body)
    })
    console.ilog(await res.text())
}