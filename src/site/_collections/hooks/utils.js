/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Reusable hooks for authors and tags
 */

const addPagination = require('../../_utils/add-pagination');
const filterByLang = require('../../_filters/filter-by-lang');
const {defaultLocale} = require('../../_data/site');
const {i18n} = require('../../_filters/i18n');

/**
 * Used to add the title and description for use by cards
 * as well as for the title of paginated pages.
 *
 * @param {VirtualCollectionItem[]} items
 * @param {string} path
 * @param {string} [lang]
 * @return {VirtualCollectionExpandedItem[]}
 */
const addFields = (items, path, lang = defaultLocale) => {
  return items.map((s) => {
    const title = i18n(`${path}.${s.key}.title`, lang);
    const description = i18n(`${path}.${s.key}.description`, lang);

    return {
      ...s,
      ...{
        description,
        title,
        data: {
          ...s.data,
          alt: title,
          date: s.data.date,
          hero: s.data.hero,
          subhead: description,
          title,
          updated: s.data.updated,
        },
      },
    };
  });
};

/**
 * @param {VirtualCollectionExpandedItem[]} items
 * @return {VirtualCollectionExpandedItem[]}
 */
const feed = (items) => {
  const filteredFeed = [];

  if (process.env.ELEVENTY_ENV !== 'prod') {
    return filteredFeed;
  }

  for (const item of items) {
    if (item.elements.length > 0) {
      filteredFeed.push(item);
    }
  }

  return filteredFeed;
};

/**
 * @param {VirtualCollectionExpandedItem[]} items
 * @param {string} href
 * @param {string[]} testItems
 * @return {Paginated[]}
 */
const index = (items, href, testItems) => {
  let itemsWithPosts = [];

  if (process.env.PERCY) {
    itemsWithPosts = items.filter((item) => testItems.includes(item.key));
  } else {
    itemsWithPosts = items.filter((item) => item.elements.length > 0);
  }

  itemsWithPosts.sort((a, b) => a.title.localeCompare(b.title));

  return addPagination(itemsWithPosts, {href});
};

/**
 * @param {VirtualCollectionExpandedItem[]} items
 * @param {string} lang
 * @return {Paginated[]}
 */
const individual = (items, lang) => {
  let paginated = [];

  for (const item of items) {
    if (item.elements.length > 0) {
      paginated = paginated.concat(
        addPagination(filterByLang(item.elements, lang), item),
      );
    }
  }

  return paginated;
};

module.exports = {
  addFields,
  feed,
  index,
  individual,
};
