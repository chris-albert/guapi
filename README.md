
Content is a renderable object

Content Types
 - tabs
 - form
 
The `tabs` content type renders tabs to the page.
 ```
 {
   "name": "The name used for routes, this should only be camel case",
   "display": "The name displayed on the tab",
   "content": {
     "tabs|form": ... //Can be more nested tabs, or another type of content
   }
 }
 ```
 
 
The `form` content type renders a form to the page.
```
content": {
  "form": {
    "path": "Path to call",
    "method": "HTTP method to use [GET|PUT|POST]",
    "request": {
      "location": "Location of form data [query|body]",
      "auth": {
        "type": "Type of authentication [bearer|basic|none]"
      },
      "fields": [
        {
          "display": "Field display name",
          "name": "Name used when adding to query or body",
          "type": "Field type [text,password,select]",
          "disabled": "Weather field is disabled [true,false]"
        }
      ],
      "submitButton": "Name of submit button"
    },
    "response": {
      "root": "json root to get data from",
      "type": "Response type [array|object]",
      "fields": "Response fields to show, * for all that were retrieved, or array of fields to show"
    }
  }
}
```
 
