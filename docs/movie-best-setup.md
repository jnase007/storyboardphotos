# Storybook Movies — Best Setup (locked 2026-08-20)

## Every time
1. **Approve art** in Admin → Books Library (hard gate)
2. Admin → **Movies** → **Make Fast movie (~$30)**
3. Mac mini worker auto-picks it up
4. Quality lock: Seedance Fast + full narration + soft BGM + **no Ken Burns fallback**
5. Justin gets pinged when ready or failed

## Why Mac mini
Paid Seedance on Vercel dies mid-job and can re-bill. Button only **queues**. Worker renders.

## Worker
- Script: `scripts/movie_queue_worker.py`
- LaunchAgent: `~/Library/LaunchAgents/com.storybookphotos.movie-queue-worker.plist`
- Logs: `tmp-movie/queue-worker.log`
- Notify file: `tmp-movie/queue-worker-notify.txt`
- One paid movie at a time

## Quality defaults
- Model: `bytedance/seedance-2.0/fast/image-to-video`
- Clip: 15s chained to full narration hold
- BGM: on (`public/audio/storybook-bedtime-bed.mp3`)
- Ken Burns fallback: OFF
- Cost class: ~$25–35 typical short book

## Do not
- Run premium 2.5 for normal books
- Spend Seedance on unapproved art
- Re-run without a clear defect
