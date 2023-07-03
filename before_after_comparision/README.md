Before and After Comparison
========================

### About this template

This template allows you to display one or multiple pair of before and after images

Columns in the spreadsheet:

* `key` — A unique one-word descriptor for this pair of before and after images (such as the subject's name). This is used as the unique id for each photo embed.
* `headline` - The optional headline for this pair of before and after images
* `image1` - The before image filename. We assume that it will live in the `synced/` folder inside the graphic.
* `image1_alt` - Alt text for image1
* `label_hed1` — The primary label for the first button. When user clicks the button, `image1` will be displayed. The text for the label is typically "Before."
* `label_dek1` — The secondary for the first button, typically displays the date when the `image1` was taken.
* `image2` - The after image filename. We assume that it will live in the `synced/` folder inside the graphic.
* `image2_alt` - Alt text for image2
* `label_hed2` — The primary label for the second button. When user clicks the button, `image2` will be displayed. The text for the label is typically "After."
* `label_dek2` — The secondary label for the second button, typically displays the date when the `image2` was taken.
* `photo_credit` — Photo credit for `image1` and `image2`.

Key files:

* `synced/` — All images should go here. (Note: This does not get committed to the repo. Files are published using a separate syncing process. See further below.)
* `partials/_beforeafter.html` — Template code to display each pair of before and after images
* `index.html` — Allows you to see all comparisons in the spreadsheet at once

### Creating multiple pairs of before and after images

Simply add additional rows with corresponding attributes in the `data` spreadsheet with an unique `key` value 

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