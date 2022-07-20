Photo-Pullquotes Graphic
========================

### About this template

This template allows you to display large images paired with a pullquote.

Columns in the spreadsheet:

* `key` — A one-word descriptor for this image (such as the subject's name). This is used as the filename for the standalone photo embed.
* `image` - The image filename. We assume that it will live in the `synced/` folder inside the graphic.
* `layout` — Should this be played **wide**? **Center** above the quote but constrained in width? Or aligned to the **left** or **right**?
* `quote` — The quote itself. Do not include quote marks at the beginning/end. These are added in CSS.
* `name` — The subject's name
* `age` — The subject's age _(optional)_. It appears inline after the subject's name.
* `description` — A short bit of additional description _(optional)_. For example, the subject's city/state, or names of other people in the image.
* `caption` — A longer caption for the image _(optional)_.
* `photo_credit` — Photo credit for the image.

Key files:

* `synced/` — Final images should go here. (Note: This does not get committed to the repo. Files are published using a separate syncing process. See further below.)
* `partials/_photo.html` — Template code for the photo/quote/attribution/caption
* `index.html` — Allows you to see all the images in the spreadsheet at once
* `tmpl-photo.html` — Sample code for a standalone page for a single image. (More on this below.)

### Creating standalone pages for each photo

For each page you want to create, duplicate `tmpl-photo.html`.

Name it using the `key` for that image in the spreadsheet.

Then, on line 15, where the `data` object is defined, change the last parameter in `COPY.data.nipper` to the spreadsheet `key` value for this row.

### Optimizing images

Create a folder locally somewhere on your machine with the original-size images. Inside that folder, create a new folder called `resized`.

Run this ImageMagick script (from our [best practices](https://github.com/nprapps/bestpractices/blob/master/assets.md)) to resize the images:

```
for f in *.jpg; do convert $f -quality 75 -resize 1600x1200\> -strip -sampling-factor 4:2:0 -define jpeg:dct-method=float -interlace Plane resized/$f; done
```

Save the `resized` images in the `synced` folder in this project. Do not keep the original high-res images here.

### Synced files

For this project, images are synced to S3 rather than stored in the repo. Run this to retrieve / sync them:

```
node cli sync $PROJECT_SLUG
```
### Further development

* Bash script to create separate pages?
