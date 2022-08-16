# Kaholo Zip Plugin
This plugin zips files and folders into a compressed zip format archive. This serves two purposes. One is to archive many files and folders into a single package. The other is to compress the data so the resulting package is as small as possible. This saves storage space and is convenient for use cases such as attaching the zip file to an email message. Zip files are traditionally named matching `*.zip`.

For example, to install a Kaholo plugin, one must zip up the relevant files and then upload the resulting zip file. Making this zip file at the command line looks like this:

    kaholo-plugin-zip$ zip zip-plugin-2.0.zip *
        adding: app.js (deflated 69%)
        adding: config.json (deflated 76%)
        adding: INSTALL.md (deflated 58%)
        adding: LICENSE (deflated 41%)
        adding: logo.png (deflated 10%)
        adding: package.json (deflated 49%)
        adding: package-lock.json (deflated 73%)
        adding: README.md (deflated 63%)
        adding: zip-functions.js (deflated 63%)

    kaholo-plugin-zip$ ls -la *.zip
        -rw-rw-r-- 1 user user 56142 Jul 23 08:33 zip-plugin-2.0.zip

## Prerequisites
To use this plugin, you must have the zip plugin installed and some files or folders available on the Kaholo Agent node that you want to archive into a zip file. These would typically be a test or build result from earlier actions in the pipeline that you want to send on to an artifact registry or deploy pipeline.

## Working Directory
The default working directory on the Kaholo Agent is `/usr/src/app/workspace`. To put files there as a test use the Git plugin to clone a repository or the Text Editor plugin to write a new files as text. To see what files are already there use the Command Line plugin to run command `ls -la`.

The paths used in the plugin can be relative to the default working directory or absolute, and in general all the folders in the path must already exist. For example if the "Paths to Zip" are `repo-one` and `repo-two` and the "Path to Zip Archive" is `/home/zipped/file.zip`, for this to succed `/usr/src/app/workspace/repo-one` and `/usr/src/app/workspace/repo-two` must exist (as either files or directories), as well as `/home/zipped`. In contrast if the "Path to Zip Archive" is simply `file.zip`, then the result will be found at `/usr/src/app/workspace/file.zip1`.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

   "viewName": "Create Zip Archive",
          "viewName": "Path to zip archive",
          "viewName": "Paths to zip",
          "viewName": "Paths to ignore",
          "viewName": "Overwrite Existing Zip Archive",
      "viewName": "Extract Zip Archive",
          "viewName": "Path to zip archive",
          "viewName": "Extraction Path",
          "viewName": "Clear Extraction Path",


## Plugin Settings
There are no settings for default values for this plugin.

## Method Create Zip Archive
This method archives one or more files or directories into a compressed zip archive.

### Parameter Path to Zip Archive
This is for the path (relative or absolute) to a zip file (existing or not yet). Relative paths will be relative to the default working directory, `/usr/src/app/workspace/`. If the file does not exist it will be created.

### Parameter Paths to Zip
Paths to zip may include one or many paths, either relative or absolute, either to files or directories. For multiple paths list them one per line. Directories will be recursively compressed into the zip archive.

### Parameter Paths to Ignore
If there are specific files or directories along the Paths to Zip that you wish to exclude from the archive, list them here. For multiple paths list them one per line.

### Parameter Overwrite Existing Zip Archive
If enabled (`true`), any previously existing zip file at the "Path to Zip Archive" location will be deleted and a new archive will be created. Otherwise individual files and folders are updated into the zip archive - overwriting older versions of themselves and/or adding new files and paths as needed.

## Method Extract Zip Archive
This method extracts a zip file into its file and directory constituents.

### Parameter Path to Zip Archive
This is for either the full or relative path to an existing zip file. Relative paths will be relative to the default working directory, `/usr/src/app/workspace/`.

### Parameter Extraction Path
This is the path where the zip file should be extracted. It must be an existing directory on the Kaholo Agent. If omitted the default working directory will be used. If the zip archive contains directories, these will be created as needed within the Extraction path.

### Parameter Clear Extraction Path
If enabled (`true`), any previously existing files or directories in the extraction path will be deleted before the zip archive is extracted. This ensures the extract path contains only what was in the zip file, nothing from a previous extraction of another zip file or other pipelines.