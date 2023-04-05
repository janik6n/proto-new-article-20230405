#!/usr/bin/env node

import {mkdir, readFile, stat, writeFile} from 'fs/promises';
import chalk from 'chalk';
import GithubSlugger, {slug} from 'github-slugger';
import inquirer from 'inquirer';

const logError = async (message) => {
  const error = chalk.bold.red;
  console.log(error(message));
}

const logSuccess = async (message) => {
  const success = chalk.bold.green;
  console.log(success(message));
}

const logInfo = async (message) => {
  console.log(message);
}

const askInputs = async (proposedArticleDate, proposedTags) => {

  let tagChoices = [];
  for (let i = 0; i < proposedTags.length; i++) {
    tagChoices.push({"name": proposedTags[i]});
  }

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'articleTitle',
        message: "Title for the new article:"
      },
      {
        type: 'input',
        name: 'articleDate',
        message: "Date for the new article (YYYY-MM-DD):",
        default() {
          return `${proposedArticleDate}`;
        }
      },
      {
        type: 'confirm',
        name: 'createContentDirectory',
        message: `Create content directory for images?`,
        default: true
      },
      {
        type: 'confirm',
        name: 'featured',
        message: `Will this be a featured article?`,
        default: false
      },
      {
        type: 'confirm',
        name: 'draft',
        message: `Will this be a draft?`,
        default: false
      },
      {
        type: 'checkbox',
        message: 'Tags:',
        name: 'tags',
        choices: tagChoices
      },
    ]);
}

const createContentDirectory = async (path) => {
  try {
    await stat(path);
    await logInfo(`Content directory ${path} already exists.`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await logInfo(`Content directory ${path} does not exist, creating...`);
      await mkdir(path, { recursive: true });
      await logSuccess(`Content directory ${path} created successfully!`)
    } else {
      await logError(`Error creating content directory ${path}: ${err}`);
      process.exit(1);
    }
  }
}

const createArticle = async (articleDirectory, articleFileName, content) => {
  try {
    await stat(articleDirectory);
  } catch (err) {
    await logError(`Directory (${articleDirectory}) for articles does not exist: ${err}`);
    process.exit(1);
  }
  try {
    await stat(`${articleDirectory}/${articleFileName}`);
    await logError(`The article ${articleDirectory}/${articleFileName} already exists!`);
    process.exit(1);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await logInfo(`File ${articleDirectory}/${articleFileName} does not exist, creating...`);
      await writeFile(`${articleDirectory}/${articleFileName}`, content);
      await logSuccess(`Article ${articleDirectory}/${articleFileName} created successfully!`)
    } else {
      await logError(`Error creating blog article ${articleDirectory}/${articleFileName}: ${err}`);
    }
  }
}

(async () => {
  // Read custom tags data from package.json in the project root directory
  const packageJson = JSON.parse(
    await readFile(
      new URL(`${process.cwd()}/package.json`, import.meta.url)
    )
  );

  // Current date to YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);
  const contentDirectoryBasePath = `${process.cwd()}/${packageJson.astroNewArticle.contentPath}`;
  const articleDirectory = `${process.cwd()}/${packageJson.astroNewArticle.blogPath}`;

  const userInputs = await askInputs(today, packageJson.astroNewArticle.proposedTags);

  const data = {...userInputs};
  data.contentDirectory = `${contentDirectoryBasePath}/${data.articleDate}`;
  data.articleSlug = slug(data.articleTitle);
  data.ogImage = packageJson.astroNewArticle.defaultOgImage;

  // tags array to string
  let tagsString = `\n`;
  for (let i = 0; i < userInputs.tags.length; i++) {
    tagsString = tagsString.concat(`  - ${userInputs.tags[i]}\n`);
  }


  const content = `---\n` +
    `author: ${packageJson.astroNewArticle.author}\n` +
    `pubDatetime: ${data.articleDate}\n` +
    `title: ${data.articleTitle}\n` +
    `description: ${data.articleTitle}\n` +
    `postSlug: ${data.articleSlug}\n` +
    `ogImage: ${data.ogImage}\n` +
    `featured: ${data.featured}\n` +
    `draft: ${data.draft}\n` +
    `tags: ${tagsString}---\n\n## Table of contents\n\n## Intro\n\nHello`;

  await createContentDirectory(data.contentDirectory);
  await createArticle(articleDirectory, `${data.articleSlug}.md`, content);
  await logSuccess(`\nTemplate ready, time to start writing! 🚀`);
})();
