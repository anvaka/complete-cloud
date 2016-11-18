# complete-cloud

A simple world cloud visualization that shows most common google's auto completion
for questions about countries.

![why does...](https://raw.githubusercontent.com/anvaka/complete-cloud/master/media/screenshot_why_does.png)

Click on any tag to see queries:

![why does expanded](https://raw.githubusercontent.com/anvaka/complete-cloud/master/media/screenshot_why_does_love.png)

** Note **: If you are on mobile - touch and hold the tag for two seconds to see completions.

# How it's made?

For each country I query Google for autocompletions:

![why does animated](https://raw.githubusercontent.com/anvaka/complete-cloud/master/media/why_does.gif)

Then each suggestion is recorded and stored into json format:

```json
{
  "state": "Albania",
  "suggestions": [
    "why does albania<b> hate greece</b>",
    "why does albania<b> love america</b>",
    "why does albania<b> have a bad reputation</b>",
    "why does albania<b> hate serbia</b>",
    // ...
  ]
}
```

** NOTE **: This extraction work is automated and managed by [anvaka/wpg-data](https://github.com/anvaka/wpg-data)
repository. I'm trying to update this data on a daily basis.

I extract all words between `<b></b>` tags and use [world cloud layout algorithm](https://github.com/anvaka/complete-cloud/blob/master/src/lib/wordLayout/index.js)
to determine position of a word.

Common words are excluded. You can find the list of excluded words [here](https://github.com/anvaka/complete-cloud/blob/04a296b9bfccfe5eb756c41ab2bff09af8a17bdd/src/model/appModel.js#L3-L8)

Rendering is done entirely in SVG. You can pan and zoom the image to see it at
infinite precision. The interaction is managed by [anvaka/panzoom](https://github.com/anvaka/panzoom)
module.

# See also

If you want to explore Google's auto completion tags, please refer to [anvaka/what-people-google](https://github.com/anvaka/what-people-google)
repository.

## Local build

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

# License

MIT
