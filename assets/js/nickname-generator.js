/**
 * Nickname Generator - 自动生成趣味英文昵称
 * 组合规则: Adjective + Noun
 */

const ADJECTIVES = [
  'Angry', 'Bouncy', 'Breezy', 'Chubby', 'Cosmic', 'Crazy', 'Dapper',
  'Dizzy', 'Elegant', 'Fancy', 'Fluffy', 'Frosty', 'Fuzzy', 'Goofy',
  'Glowing', 'Grumpy', 'Hasty', 'Icy', 'Jolly', 'Jumpy', 'Lumpy',
  'Merry', 'Nifty', 'Perky', 'Quirky', 'Rowdy', 'Shiny', 'Silly',
  'Sleepy', 'Sneaky', 'Sparkly', 'Spicy', 'Tasty', 'Wicked', 'Wobbly',
  'Zesty', 'Brave', 'Chill', 'Fierce', 'Gentle', 'Hyper', 'Lazy',
  'Loud', 'Mystic', 'Noble', 'Proud', 'Quiet', 'Rapid', 'Salty',
  'Swift', 'Tiny', 'Vast', 'Wild', 'Witty', 'Zen',
];

const NOUNS = [
  'Badger', 'Banana', 'Cactus', 'Donut', 'Dragon', 'Ghost', 'Gnome',
  'Jellyfish', 'Knight', 'Koala', 'Llama', 'Marshmallow', 'Moose',
  'Muffin', 'Ninja', 'Otter', 'Pancake', 'Panda', 'Pickle', 'Pigeon',
  'Pirate', 'Potato', 'Robot', 'Sloth', 'Squid', 'Toad', 'Turtle',
  'Unicorn', 'Waffle', 'Walrus', 'Wizard', 'Yeti', 'Alien', 'Bison',
  'Camel', 'Dolphin', 'Eagle', 'Falcon', 'Giraffe', 'Hippo', 'Iguana',
  'Jaguar', 'Kangaroo', 'Lemur', 'Monkey', 'Narwhal', 'Octopus',
  'Penguin', 'Quokka', 'Raccoon', 'Shark', 'Tiger', 'Umbrella',
  'Vulture', 'Whale', 'Zebra', 'Astronaut', 'Baker', 'Chef',
  'Dancer', 'Engineer', 'Farmer', 'Guardian', 'Hero', 'Inventor',
  'Jester', 'King', 'Librarian', 'Magician', 'Nurse', 'Painter',
  'Queen', 'Runner', 'Singer', 'Teacher', 'Viking', 'Warrior',
];

function getRandomItem(arr, exclude = []) {
  const filtered = exclude.length ? arr.filter(x => !exclude.includes(x)) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * 生成一个随机昵称
 * @param {Array} usedNicknames 已使用的昵称列表（可选），避免重复
 * @returns {string} 如 "Cosmic Donut"
 */
export function generateNickname(usedNicknames = []) {
  let maxAttempts = 100;
  let nickname;

  while (maxAttempts-- > 0) {
    const adj = getRandomItem(ADJECTIVES);
    const noun = getRandomItem(NOUNS);
    nickname = `${adj} ${noun}`;

    if (!usedNicknames.includes(nickname)) {
      return nickname;
    }
  }

  // 极端情况：如果都重复了，加个数字后缀
  const adj = getRandomItem(ADJECTIVES);
  const noun = getRandomItem(NOUNS);
  return `${adj} ${noun} ${Math.floor(Math.random() * 99) + 1}`;
}

/**
 * 生成多个不重复的昵称候选
 * @param {number} count 数量
 * @returns {string[]}
 */
export function generateNicknameOptions(count = 3) {
  const options = [];
  while (options.length < count) {
    const nickname = generateNickname(options);
    options.push(nickname);
  }
  return options;
}

// 兼容全局
if (typeof window !== 'undefined') {
  window.NicknameGenerator = { generateNickname, generateNicknameOptions };
}
