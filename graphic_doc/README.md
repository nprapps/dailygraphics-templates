Graphic Doc
===========

This template allows you to use a Google Doc as the underlying content for your graphics project. You can use standard Docs formatting (bold, italic, links, etc.) and it should translate over automatically.

You can set your content up with key/value pairs, like the `{ intro }` and `{ footer }` sections are set up. Or you can specify sections of similarly-formatted structured content to loop through with a `[ sequence ] ... []` wrapping a set of `id` instances. (This is basically the same as how we do sectioned content in the [interactive template](https://github.com/nprapps/interactive-template) and slides in the [scrolly](https://github.com/nprapps/scrolly-template) template.)

If you need to accommodate more-structured data along with prose, you can optionally associate a spreadsheet with a given project. You can create one when you start your project (make sure the "create sheet" checkbox is checked), or add a reference to the spreadsheet ID later to `manifest.json`. It should look like this:

```
  "sheet": "1BnCzUcmrGTux6AITqIMRCenMyrjhGYa9ABVNKah5Esk",
  "doc": "1M2RzdBkf8ZN-qF2Irx13Ckj7bdSh-go0Ue2Eo0NSKGM",
```

If you keep the `{ metadata }` section of your doc, it will populate the automated copyedit note. If a project has both a doc and a spreadsheet, and _both_ have metadata, the copyedit note will use the version in the doc.