Before and After Comparison with AI2HTML
========================

### About this template

This template offers an animated toggle between two ai2html graphics (a "before" and an "after") — often useful for comparing satellite imagery between two time periods.

By default, this template offers the ability to create multiple before and afters in the same graphic slug, as it is common for a single story to have a few such before and after graphics. 

### Creating a new before and after set of graphics

Create an html file, with a name of your choosing. The name of this file will later be the `key` used in the first row of the spreadsheet. For example, if you created a file called `example1.html`, your file should contain the following code:

```
<% var key = 'example1' %>

<%= await t.include("lib/_head.html") %>
<%= await t.include("partials/_beforeafter.html", { COPY: { ...COPY, data: [ COPY.data[key] ]}}) %>

<script src="./graphic.js"></script>

<%= await t.include("lib/_foot.html") %>
```

**NOTE:** The only thing you change from this code is the `example1` in the key variable at top. Change it to whatever your `key` will be in your spreadsheet. 

Next, in the `synced` folder, create your .ai file. This file should be probably be named the same as the `key`, so in our case, `example1.ai`. Create your file, and then run ai2html so that your root directory now also contains your ai2html file. In our example, that is called `_example1.html`. This is also the value of `aiFile` in your spreadsheet. 

Next fill out the spreadsheet. Each row is a different set of before/after ai2html graphics. 

Reminder: There is no "labels" tab in the spreadsheet, because all labels are created in the "data" tab of the spreadsheet in this type of graphic. 
 
-----

### Columns in the spreadsheet

Columns in the spreadsheet:
* `key` — A unique one-word descriptor for this pair of before and after graphics (such as the location the image). This is used as the unique id for each ai2html embed.
* `aiFile` - The name of the ai2html output .html file for each before and after set. This is also set in your ai2html settings under `project_name`. 
* `headline` - A headline for this pair of before and after graphics _(optional)_. This is in lieu of filling in the headline in the `labels` tab, as it doesn't exist.
* `subhed` - A subhed for this pair of before and after graphics _(optional)_. This is in lieu of filling in the subhed in the `labels` tab, as it doesn't exist.
* `label_hed1` — The primary label for the first button. When user clicks the button, graphic 1 will be displayed. The text for the label is typically "Before."
* `label_dek1` — A secondary label for the first button — typically the date when the graphic 1 was taken. _(optional)_
* `label_hed2` — The primary label for the second button. When user clicks the button, graphic 2 will be displayed. The text for the label is typically "After."
* `label_dek2` — A secondary label for the second button — typically the date when the graphic 2 was taken. _(optional)_
* `credit` — Photo and/or graphics credit for graphic 1 and graphic 2. _(optional)_
* `source` — Source for graphic 1 and graphic 2. _(optional)_
* `footnote` — Footnote for graphic 1 and graphic 2. _(optional)_

Key files:

* `synced/` — All illustrator files and ai2html output images should go here. (Note: This does not get committed to the repo. Files are published using a separate syncing process. See further below.)
* `partials/_beforeafter.html` — Template code to display each pair of before and after graphics
* `index.html` — View all before/after comparisons in this project

-----

### Synced files

For this project, images and AI files are synced to S3 rather than stored in the repo. Run this in dailygraphics-next to retrieve / sync them:

```
node cli sync $PROJECT_SLUG
```


ai2html 
=======

The ai2html template uses an open-source script called [ai2html](http://ai2html.org/) to convert Illustrator graphics to HTML and CSS and display them in our responsive dailygraphics template.

(This assumes you have already set up the dailygraphics-next rig and have it running on your computer. You can find more information about setting up the rig in the [dailygraphics-next documentation](https://github.com/nprapps/dailygraphics-next).)

Installing ai2html
------------------

To use this template, you'll need to install ai2html as an Illustrator script. Copy [the latest version of the script here](https://github.com/nprapps/dailygraphics-templates/blob/master/_etc/ai2html_v115.jsx) into the Illustrator folder on your machine where scripts are located. For example, on Mac OS X running Adobe Illustrator CC 2023, the path would be: `/Applications/Adobe Illustrator CC 2023/Presets.localized/en_US/Scripts/`

**You only need to install the script once on your machine.** To check whether you have it installed, open Adobe Illustrator and look for the "ai2html_v115" command in File >> Scripts.

Creating a new ai2html graphic
------------------------------

To create a new ai2html graphic, click the "new()" button in the toolbar and select "Ai2html Graphic" from the list of templates. You'll also need to provide a slug for the graphic--this will have the current date in YYYYMMDD format appended to it, to prevent collisions.

Once you click through, the rig will create a new folder and copy the template files into it. It will also make a duplicate of the template's assigned Google Sheet, for loading labels and data. Finally, it'll take you to the graphic preview page.

The basic ai2html project includes an Illustrator file in `assets`, which you'll use to create your graphic. The three artboards in the file are the three breakpoints for your graphic, allowing you to create custom versions for mobile, tablet and desktop-sized screens. (If you want to change the width of these artboards, you'll need to adjust the media queries in `graphic.less`.)

You can only use fonts that are supported on our website, so make sure you are using the correct typeface and weight. [Here's a list of supported fonts](https://github.com/nprapps/dailygraphics-templates/blob/master/_etc/ai2html_v115.jsx#L138-L159). (For users outside of NPR, refer to the [ai2html docs](http://ai2html.org/#using-fonts-other-than-arial-and-georgia) to learn how to customize your fonts.)

Create your graphic within Illustrator, referring to the [ai2html documentation](http://ai2html.org/#how-to-use-ai2html) for help. When you're ready to export, run File >> Scripts >> ai2html. The resulting graphic will appear within the base template when you load the preview!
