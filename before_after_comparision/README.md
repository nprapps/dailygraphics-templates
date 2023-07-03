Before and After Comparison
========================

### About this template

This template offers an animated toggle between two images (a "before" and an "after") — often useful for comparing satellite imagery between two time periods.

Columns in the spreadsheet:

* `key` — A unique one-word descriptor for this pair of before and after images (such as the location the image). This is used as the unique id for each photo embed.
* `headline` - A headline for this pair of before and after images _(optional)_. This is most useful in cases where you are including multiple before/after toggles in the same embed.
* `image1` - The before image filename. We assume that it will live in the `synced/` folder inside the graphic.
* `image1_alt` - Alt text for `image1`
* `label_hed1` — The primary label for the first button. When user clicks the button, `image1` will be displayed. The text for the label is typically "Before."
* `label_dek1` — A secondary label for the first button — typically the date when the `image1` was taken. _(optional)_
* `image2` - The after image filename. We assume that it will live in the `synced/` folder inside the graphic.
* `image2_alt` - Alt text for `image2`
* `label_hed2` — The primary label for the second button. When user clicks the button, `image2` will be displayed. The text for the label is typically "After."
* `label_dek2` — A secondary label for the second button — typically the date when the `image2` was taken. _(optional)_
* `photo_credit` — Photo credit for `image1` and `image2`. _(optional)_

Key files:

* `synced/` — All images should go here. (Note: This does not get committed to the repo. Files are published using a separate syncing process. See further below.)
* `partials/_beforeafter.html` — Template code to display each pair of before and after images
* `index.html` — View all before/after comparisons in this project

-----

### Creating multiple pairs of before and after images

Add rows with corresponding attributes in the `data` spreadsheet with a unique `key` value. Then, depending on your desired way of presenting the images:

#### All pairs appear in the same embed

By default, `index.html` is set up to show all before/after pairs in the spreadsheet, in the order they're listed in the spreadsheet.

#### Each pair gets its own embed

If you want separate embeds for each before/after pair in the spreadsheet:

* Make a copy of `index.html` and rename it according to the `key` for that row
* Change this section of code:

```
<% for (let key of Object.keys(COPY.data)) { %>
    <%= await t.include("partials/_beforeafter.html", { COPY: { ...COPY, data: [ COPY.data[key] ]}}) %>
<% } %>
```

to:

```
<%= await t.include("partials/_beforeafter.html", { COPY: { ...COPY, data: [ COPY.data['KEY_FOR_THIS_ROW'] ]}}) %>
```

-----

### Optimizing images

Create a folder locally somewhere on your machine with the original-size images. Inside that folder, create a new folder called `resized`.

Run this ImageMagick script (from our [best practices](https://github.com/nprapps/bestpractices/blob/master/assets.md)) to resize the images:

```
for f in *.jpg; do convert $f -quality 75 -resize 1600x1200\> -strip -sampling-factor 4:2:0 -define jpeg:dct-method=float -interlace Plane resized/$f; done
```

Save the `resized` images in the `synced` folder in this project. Do not keep the original high-res images here.

-----

### Synced files

For this project, images are synced to S3 rather than stored in the repo. Run this to retrieve / sync them:

```
node cli sync $PROJECT_SLUG
```