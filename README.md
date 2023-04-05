# proto-new-article-20230405

Testing CLI tool package publishing to NPM.

Scaffold new blog post for [Astro-based]() blog using theme[Astro Paper]().

## Installation:

In your blog project, install package using npm:
```bash
npm install @janik6n/proto-new-article-20230405 --save-dev
```

## Configuration

Scaffolding uses custom configuration in root-level `package.json`. Add the following configuration block:

```json
"astroNewArticle": {
  "blogPath": "src/content/blog",
  "contentPath": "public/assets",
  "author": "Demo Writer",
  "defaultOgImage": "http://[domain-here]/demo.jpg",
  "proposedTags": [
    "Azure",
    "AWS",
    "Node.js",
    "Python",
    "serverless"
  ]
}
```

Parameters:

- blogPath: Path to markdown files for blog (this should not require changes).
- contentPath: Path to local images etc. for blog articles (this should not require changes). Scaffolding will create a directory in here, with date as name, e.g. `2023-04-05`.
- author: Author's name.
- defaultOgImage: Default OG image to be used.
- proposedTags: Which tags are selectable while scaffolding

Most of these will affect to generated frontmatter.

## Usage

After installing the package and adding the required configuration, on the project root-level, run & follow the prompt:
```bash
npx new-article
```

Optionally you can add this also to `scripts` in `package.json`, for example `"new": "new-article"`. Then you can run `npm run new`.


MIT License. Copyright janik6n.
