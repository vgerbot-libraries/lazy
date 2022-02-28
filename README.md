# @vgerbot/lazy  ![NPM](https://img.shields.io/npm/l/@vgerbot/lazy?style=social)

[![Test](https://github.com/y1j2x34/lazy/actions/workflows/runtest.yml/badge.svg)](https://github.com/y1j2x34/lazy/actions/workflows/runtest.yml)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/c829a1a9caa9451abe0a1c1dc71a87da)](https://www.codacy.com/gh/y1j2x34/lazy/dashboard?utm_source=github.com&utm_medium=referral&utm_content=y1j2x34/lazy&utm_campaign=Badge_Coverage)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/c829a1a9caa9451abe0a1c1dc71a87da)](https://www.codacy.com/gh/y1j2x34/lazy/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=y1j2x34/lazy&amp;utm_campaign=Badge_Grade)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-round)](https://github.com/prettier/prettier)

A library for defining lazily evaluated properties.

Some property values that are expensive to generate can delay initialization until the property is needed.
In some scenarios, some attribute values do not need to be initialized immediately at the beginning,
and initializing these attributes immediately has a great impact on performance.
You can improve performance by deferring property initialization until it is needed through lazy evaluation.

## Install

```bash
npm i @vgerbot/lazy
```

## Usage

### `@lazyMember` decorator

> `@lazyMember` requires the `"experimentalDecorators": true` in your `tsconfig.json` file

```ts
import { lazyMember } from '@vgerbot/lazy';

function getFriends(id: string, params: Record<string, string | number> = {}): Promise<User[]> {
    const url = new URL('http://api.domain.com/friends');
    url.searchParams.append('userId', id);
    for(const key in params) {
        url.searchParams.append(key, params[key]);
    }
    console.log('fetch: ',url);
    return fetch(url)
        .then(resp => {
            return resp.json()
        })
        .then(data => userListOf(data));
}

class User {
    @lazyMember<User, 'friends'>(user => getFriends(user.id))
    friends!: Promise<User[]>;

    @lazyMember<User, 'littleBrothers'>({
        evaluate: user => getFriends(user.id, {maxAge: user.age}),
        resetBy: ['age']
    })
    littleBrothers!: Promise<User[]>;

    constructor(readonly id: string, age: number) {
    }
}

const user = new User('a5cba8f', 18)

user.friends.then(() => {})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f"

user.friends.then(() => {}) // nothing output

user.littleBrothers.then(() => {})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f&maxAge=18"

user.littleBrothers.then(() => {})
// nothing is output

user.age = 19;
// The `age` property has changed, so the `littleBrothers` property will also be reset.

user.littleBrothers.then(() => {})
// console output: "fetch:  http://api.domain.com/friends?userId=a5cba8f&maxAge=<b>19</b>"

```

## LICENSE

`@vgerbot/lazy` is [MIT Licensed](https://github.com/y1j2x34/lazy/blob/master/LICENSE)
