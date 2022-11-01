# code-itop-tools README
VSCode extension for combodo iTop. Includes snippets and various functions.

## Installation
Available at scheiblingco/code-itop-tools on VSCode Marketplace and OpenVSX.

## Usage
Install the package, press F1 or Ctrl + Shift + P and type iTop to see the commands. Before using the commands, you need to set an iTop URL in the settings (code-itop-tools.itop-url) or via the config file parser (code-itop-tools.getURLFromConfigFile).
Once done, you can use the commands below. The snippets are available from activation.

## Extensions
The following extensions are installed together with this package
* redhat.vscode-xml: XML Tools for datamodel changes
* DotJoshJohnson.xml: XML Formatting, XQuery and XPath Tools
* bmewburn.vscode-intelephense-client: Intellisense/Intelephense client for PHP Development
* PrateekMahendrakar.prettyxml: XML Formatting tools

## Settings
The following settings are available to customize the plugin behaviour:
* `code-itop-tools.ignore-certificate-errors`: Ignore self-signed and invalid certificates when making requests
* `code-itop-tools.timeout`: Requests timeout in seconds
* `code-itop-tools.symlinks`: Enables/disables the use of symlinks for plugin PHP files
* `code-itop-tools.itop-url`: The URL for the iTop Instance, can be set manually or via code-itop-tools.getURLFromConfigFile command
* `code-itop-tools.toolkit-path`: The URL for the iTop Instance, can be set manually or via code-itop-tools.getURLFromConfigFile command

## Commands
|Command|Description|
|code-itop-tools.getURLFromConfigFile|Get the iTop URL from a configuration file (config-itop.php)|
|code-itop-tools.checkDatamodel|Check the datamodel against warnings and misconfigurations|
|code-itop-tools.applyCodeChanges|Apply changes made to extension code. If you want to customize symlink behaviour, do this under settings|
|code-itop-tools.applyAllChanges|Apply changes made toe extension code and data model changes. If you want to customize symlink behaviour, do this under settings|

## Snippets
|Snippet|Description|
|---|---|
|presitem|Creates a presentation list item (item#x>rank{y}|
|itopclass|Creates a class XML template|
|stringfield|Creates an AttributeString field|
|textfield|Creates an AttributeText field|
|enumfield|Creates an AttributeEnum field|
|boolfield|Creates an AttributeEnum field with true/false options|
|objectkey|Creates an AttributeObjectKey field|
|extkeyfield|Creates an AttributeExternalKey field|
|extfield|Creates an AttributeExternalField field|
|linksetfield|Creates an AttributeLinkedSet field|
|indirectlinksetfield|Creates an AttributeLinkedSetIndirect field|
|extkeyfield|Creates an AttributeExternalKey field|
|datefield|Creates an AttributeDate field|


## Known Issues/TODO
None yet, feel free to open a ticket if you find any.

TODO
- [ ] Add more snippets
- [ ] Comment and clean code
- [ ] Add more commands for various API actions/stimuli/queries
- [ ] Add tests and linting 

## Release Notes
Release information

### 0.2.1
  - Added AttributeInteger and AttributeDecimal fields to snippets

### 0.2.0
  - Added extensions needed/recommended for iTop development
  - redhat.vscode-xml: XML Tools for datamodel changes
  - DotJoshJohnson.xml: XML Formatting, XQuery and XPath Tools
  - bmewburn.vscode-intelephense-client: Intellisense/Intelephense client for PHP Development
  - PrateekMahendrakar.prettyxml: XML Formatting tools

### 0.1.1
- Added question to disable certificate validation for self-signed certificates when configuring URL from config file (in addition to setting)

### 0.1.0
Initial release

- Snippets for XML file creation
- Functions for toolkit (validate datamodel, apply code changes, apply database changes)
- Config file parser for iTop URL