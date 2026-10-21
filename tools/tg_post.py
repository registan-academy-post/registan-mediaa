"""Post queued items to Telegram. Run by GitHub Actions; the bot token comes from the
TELEGRAM_BOT_TOKEN repository secret and never appears in the repo.

Queue item: queue/pending/<id>.json
{
  "id": "2026-10-22-0800",
  "not_before": "2026-10-22T08:00:00+05:00",   # optional
  "steps": [ {"method": "sendMediaGroup", "params": {...Bot API params...}},
             {"method": "sendPoll", "params": {...}} ]
}
Only the Academy channel and the owner's private chat are allowed as chat_id.
"""
import json, os, sys, time, glob, shutil, urllib.request, urllib.error
from datetime import datetime, timezone

TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
API = f"https://api.telegram.org/bot{TOKEN}/"
OWNER = "5663766757"
ALLOWED = {"@RegistanLC_Academy", "-1001675672165", OWNER}
URL_KEYS = ("photo", "video", "document", "animation", "audio", "media")

def call(method, params):
    req = urllib.request.Request(API + method, data=json.dumps(params).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            return {"ok": False, "description": f"HTTP {e.code}"}

def urls_in(params):
    out = []
    for k in URL_KEYS:
        v = params.get(k)
        if isinstance(v, str) and v.startswith("https://"):
            out.append(v)
        if isinstance(v, list):
            out += [m.get("media") for m in v if isinstance(m, dict) and str(m.get("media", "")).startswith("https://")]
    return out

def wait_for(urls):
    for u in urls:
        for _ in range(12):
            try:
                with urllib.request.urlopen(urllib.request.Request(u, method="HEAD"), timeout=20) as r:
                    if r.status == 200:
                        break
            except Exception:
                pass
            time.sleep(10)

def main():
    if not TOKEN:
        print("TELEGRAM_BOT_TOKEN secret is missing"); sys.exit(1)
    now = datetime.now(timezone.utc)
    for path in sorted(glob.glob("queue/pending/*.json")):
        item = json.load(open(path, encoding="utf-8"))
        nb = item.get("not_before")
        if nb and datetime.fromisoformat(nb) > now:
            print("not yet:", path); continue
        results, ok = [], True
        for step in item.get("steps", []):
            p = step.get("params", {})
            if str(p.get("chat_id")) not in ALLOWED:
                results.append({"ok": False, "description": f"chat_id {p.get('chat_id')} not allowed"}); ok = False; break
            wait_for(urls_in(p))
            r = call(step["method"], p)
            if not r.get("ok"):
                time.sleep(15); r = call(step["method"], p)
            results.append(r)
            if not r.get("ok"):
                ok = False; break
        item["results"] = results
        item["posted_at"] = datetime.now(timezone.utc).isoformat()
        dest = ("queue/sent/" if ok else "queue/failed/") + os.path.basename(path)
        json.dump(item, open(dest, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        os.remove(path)
        print(("SENT " if ok else "FAILED ") + path)
        if not ok:
            err = results[-1].get("description", "unknown error") if results else "no steps"
            call("sendMessage", {"chat_id": OWNER, "text": f"⚠️ Post yuborilmadi: {item.get('id', path)}\nSabab: {err}"})

if __name__ == "__main__":
    main()
