Dailygraphics Templates
=======================

A collection of data visualization templates for the `NPR Daily Graphics Next rig <http://github.com/nprapps/dailygraphics-next>`_.

How a template becomes a graphic
--------------------------------

*In which the process describes the product*

When you create a graphic in the dailygraphics-next rig, it does the following:

#. A destination folder is created for the graphic.
#. The full contents of the ``_base`` template are copied into that folder, ignoring any files starting with ".".
#. The full contents of the template folder are copied over into the same folder, also ignoring dot-prefixed files. Files from the specific template will overwrite those from the ``_base`` if they have the same name.
#. The template's ``manifest.json`` file is loaded and parsed.
#. If there is a ``templateSheet`` property in the manifest, a duplicate of that Google Sheet will be created, and its ID will be stored in the manifest's ``sheet`` property for the graphic.
#. If the graphics repo has a ``package.json`` file, its dependencies will be added to the manifest's ``installedPackagesAtCreation`` property for archiving purposes.
#. The updated manifest is written out into the graphics directory.
#. Process complete! The rig now loads the new graphic for preview.

The only technical requirements for the instantiation process are the presence of a ``_base`` directory, and one ``manifest.json`` file for each template. However, there are some conventions that we have followed with these templates, in order to make things easier.

Template conventions
--------------------

The ``_base`` template contains common files that are used across most graphics, such as the base styles, JavaScript helper modules, and an ``index.html`` file that's the actual entrypoint for the graphic and includes the header and footer boilerplate.

The index file also loads two asset files, ``graphic.js`` and ``graphic.less`` (loaded with a .css extension). The template base includes boilerplate versions of these files, but you'll likely want to add versions of these files with your own scripts and styles in your template.

Many of the templates included here only override two files from the base: ``index.html`` for markup and ``graphic.js`` for visualization, since they don't require any custom styles.

Your template's ``manifest.json`` file should also include a "files" property, which details which source files should be uploaded during deployments. The deployment task has a default list if this isn't included, but most templates should have their own version. The property is an array of `minimatch <https://github.com/isaacs/minimatch>`_ globbing patterns. Most templates included here have a list that deploys ``index.html``, ``graphic.js``, ``graphic.less``, and any image or common data files that it can find, including those in subdirectories.

Future-proofing templates
-------------------------

When graphics in dailygraphics-next load their JS dependencies, such as D3, it defaults to loading them from the ``node_modules`` in the root of the graphics repo. This means that they can share code, and the instantiation process is much easier.

Over time, however, you may want to update a dependency, such as D3, that won't be compatible with the old graphic. When that happens, rather than update all your templates simultaneously (probably a time-consuming task), you can add a local copy of the template's dependencies to fill the gaps.

Setting up local depencies for a template is a relatively short process:

#. In the template directory, run ``npm init -y`` to create a minimal package file.
#. Install the legacy versions of incompatible libraries. You don't need to install everything, just the libraries that are broken--since they'll be copied each time it's created, this will save space.
#. Add "!node_modules/**/*" to the manifest's "files" list so that deployments won't try to upload the source files.

That's it! Once the template is updated to the newest version of the library, you can delete the ``node_modules`` folder--graphics created with it will still have their own copies, and will continue to work.

Migrating from the original dailygraphics rig
---------------------------------------------

When moving graphics and templates over from the classic rig, there are three changes you'll need to make:

* Add a ``manifest.json`` with the sheet/template sheet (formerly defined as ``COPY_GOOGLE_DOC_KEY`` in ``graphic_config.py``)
* Copy your child template into ``index.html``, or copy ``index.html`` from the base template and change the ID on the div.
* Convert the Jinja2 templating to EJS templates. This is usually pretty straightforward translation of tags:

  - ``{{ key }}`` becomes ``<%= key %>``
  - ``{% if condition %} ... {% endif %}`` becomes ``<% if (condition) { %> ... <% } %>``
  - ``{% for item in list %} ... {% endfor %}`` becomes ``<% list.forEach(item => { %> ... <% }) %>``

* Load scripts using Browserify instead of the ``JS.include`` template helpers:

  - Create a normal script tag that points toward the "base" script, which will load the others. This is usually ``graphic.js``.
  - For scripts that load onto the global object, you can just require their relative path, such as ``require("./lib/pym.js")``
  - Scripts that are module-aware can be imported to a variable, such as ``var d3 = require("./lib/d3.min")``
  - Scripts that relied on global scope, such as ``helpers.js``, will need their functions assigned to the window object (e.g., ``var classify = window.classify = ...``).

Since most classic dailygraphics already bundled their own JS libraries, you shouldn't need to worry about NPM for these.

Other files
-----------

The template folder also contains a set of HTML files that are required for the rig to function, which we've broken out so that they can be customized for non-NPR newsrooms:

* copyedit.html - The copy-edit e-mail text
* embed.html - The embed code used to place the interactive into a CMS page
* link.html - The "direct link" (used at NPR for stories distributed via the API, such as in-appp views)

Currently, the rig doesn't check for these to exist on startup, so it may crash if they're missing. Make sure your template repo is up-to-date if you see them listed in the stack trace!
