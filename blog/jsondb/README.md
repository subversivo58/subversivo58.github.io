## Post Database Repository (JSON files)

The nomenclature of post database files follows the ascending numeric order.

The `ids` field is an `{Array}` containing the post identifiers, which are identified in the alpha-numeric format ([a-zA-Z0-9]) following the [hashids](https://github.com/ivanakimov/hashids.js) library.

The `modified` field records the changes to posts by informing: user, date and modified post (id).

The `posts` `{Array}` field contains the list of posts (objects).

The basic structure may look something like this:


**1.json**

```json
{
    "id": 1,
    "ids": [
        "eoPLqhahv4K",
        "kNW9OhXHePG",
        "eo4oQh8FV7n",
        "JY4vmhNuQPO"
    ],
    "initial_data": "Wed Jun 28 2017 17:11:10 GMT-0300 (Hora oficial do Brasil)",
    "modified": [
        {
            "user": {
                "id": "xxxxxxxxxxx",
                "alias": "Subversivo58"
            }
            "date": 1510821016096,
            "posts": []
        }
    ],
    "posts": [
        {
            "id": "eoPLqhahv4K",
            "date": 1498685298631,
            "comments": false,
            "cover": "cover.png",
            "file": "xxxxxxxxxxxxxxxxx.md",
            "title": "Awesome Title in max 35 characters",
            "desc": "Awesome description in max length 200 characters",
            "tags": [
                "self",
                "description"
            ],
            "author": 1,
            "related": []
        },
        {
            "id": "kNW9OhXHePG",
            "date": 1498685298631,
            "comments": true,
            "cover": "cover.jpg",
            "file": "xxxxxxxxxxxxxxxxx.md",
            "title": "Awesome Title",
            "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam purus enim, posuere mattis est. Consectetur adipiscing elit.",
            "tags": ["css3"],
            "author": 1,
            "related": []
        },
        {
            "id": "eo4oQh8FV7n",
            "date": 1510773019941,
            "comments": true,
            "cover": "",
            "file": "xxxxxxxxxxxxxxxxx.md",
            "title": "Example of The Last Post 3",
            "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam purus enim, posuere mattis est. Consectetur adipiscing elit.",
            "tags": ["javascript"],
            "author": 1,
            "related": []
        },
        {
            "id": "JY4vmhNuQPO",
            "date": 1510821016096,
            "comments": true,
            "cover": "cover.jpg",
            "file": "xxxxxxxxxxxxxxxxx.md",
            "title": "Awesome Title",
            "desc": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam purus enim, posuere mattis est.",
            "tags": [
                "html5",
                "javascript",
                "css",
                "web",
                "projects",
                "opensource"
            ],
            "author": 1,
            "related": []
        }
    ]
}

```