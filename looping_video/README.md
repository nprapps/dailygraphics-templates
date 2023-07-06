Looping Video Graphic
=====================

## About this template

This template allows you to embed a muted looping video on a story page.

Columns in the spreadsheet:

* `key` — A one-word descriptor for this image (such as the subject's name or location). This is used as the filename for the standalone video embed.
* Video filenames — By default, we produce 3 different versions of the video. The spreadsheet assumes that they follow a consistent naming convention (though the formulas in the spreadsheet can be overridden).
  * `video_base` — The base filename for the video. Can be the same as the `key` if you wish.
  * `video_url` — Filename for the desktop version of the video
  * `video_mobile_url` — Filename for the mobile version of the video
  * `video_poster` — Filename for the video's poster image (the still displayed while the video is loading)
* `caption` — A caption for the video _(optional)_
* `credit` — A credit for the video _(optional)_
* `link` — On the HP version of the video embed, this is the destination link if someone clicks on the video

Key files:

* `synced/` — Final videos should go here. (Note: This does not get committed to the repo. Files are published using a separate syncing process. See further below.)
* `partials/_video.html` — Template code for muted looping video
* `video.html` — Sample code for a standalone page for a single image. (More on this below.)
* `video-hp.html` — Sample code for a standalone page for a single video. (More on this below.)

-----

## Creating standalone pages for each video

For each video embed you want to create for this project, duplicate `video.html` and `video-hp.html`.

Name it using the `key` for that image in the spreadsheet.

Then, on line 3, where the `data` object is defined, change the last parameter in `COPY.data.video` to the spreadsheet `key` value for this row.

-----

## Media files

### Video

Use `ffmpeg` to scale down outsize video, where `-i` specifies the input filename and the final line specifies the output filename. A sometimes-useful additional flag: `-t` specifies a max duration, in seconds. _(Adapted from our [best practices](https://github.com/nprapps/bestpractices/blob/master/assets.md) documentation.)_

These snippets assume that:
* In Terminal, you are in the directory for this graphic
* Your original files are stored in a folder called `_originals` in the `synced` folder inside this graphic

```
ffmpeg \
-i synced/_originals/video.mp4 \
-an \
-vcodec libx264 \
-preset veryslow \
-strict -2 \
-pix_fmt yuv420p \
-crf 21 \
-vf scale=1002:-1 \
synced/video.mp4

ffmpeg \
-i synced/_originals/video.mp4 \
-an \
-vcodec libx264 \
-preset veryslow \
-strict -2 \
-pix_fmt yuv420p \
-crf 21 \
-vf scale=600:-1 \
synced/video-mobile.mp4
```

Note: If you get a `height not divisible by 2` error, adjust the `-vf scale=1002:-1 \` value until you no longer get that error.

### Poster image

`ffmpeg` can also generate a static poster image for the video.

```
ffmpeg \
-i synced/_originals/video.mp4 \
-frames:v 1 \
synced/video-poster.jpg
```

Note: You may see errors when you run this. As long as a workable JPG is still produced, you can ignore these.

### Syncing files

For this project, videos are synced to S3 rather than stored in the repo. Run this to retrieve / sync them:

```
node cli sync $PROJECT_SLUG
```

### Where to publish media files

Use the `media_base_path` paramter in the `labels` sheet of the spreadsheet to specify where to point to the video files. By default, it points to the local synced folder. However, ESPECIALLY if a video will be embedded on a high-traffic place like the homepage, it might be preferable to upload the video to a different media server.

**NPR users:** Create a folder in `www/assets/multimedia/YYYY/$PROJECT_SLUG` and copy the video files there. Then update the `media_base_path` in the spreadsheet to point to `https://media.npr.org/assets/multimedia/YYYY/$PROJECT_SLUG/`

-----

## Sources/credits

The sample video included with this template comes from an "[Earth from Space](https://images.nasa.gov/details/jsc2022m000172_Earth_in_4K_Expedition_65_Edition)" video produced by NASA.

Video player icons: [Google Material Design icon library](https://fonts.google.com/icons?selected=Material+Icons&icon.category=av&icon.style=Filled)

-----

## Future development

* Use interaction observer to only autoplay the video when it's visible onscreen?
* Accessibility test