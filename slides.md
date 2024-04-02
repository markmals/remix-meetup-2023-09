---
theme: ./theme
background: hibiscus-bg.jpg
highlighter: shiki
lineNumbers: false
transition: slide-left
title: How to Create Your Own JavaScript Framework
---

# How to Create Your Own JavaScript Framework

## Using Web Components, Reactivity, and @remix-run/router to Build a Bespoke Web Framework

\#UseThePlatform

<!-- This talk will explore the inner workings of frameworks like React, React Router, and Remix, introduce the components needed to make your own JavaScript framework, and demonstrate how to assemble them to create your own custom runtime for single-page, client-side-routed web applications. -->

---
layout: image-left
image: profile.jpg
---

# Hi! I'm Mark 👋

I'm a UX designer and developer who makes exploratory prototypes with code. My pronouns are they/them.

<div class="flex flex-row items-center gap-3">

<img src="/mastodon.svg" alt="mastodon-logo" class="w-10 h-10">

[@markmalstrom@universeodon.com](https://universeodon.com/@markmalstrom)

</div>

<div class="flex flex-row items-center gap-3">

<img src="/github.svg" alt="github-logo" class="w-10 h-10">

https://github.com/markmals

</div>

---

# Why did I do this?

- I started learning UI programming with SwiftUI and I wanted to see how possible it was to make something like it for the web
- I wanted to see how far I could get with web standards and utility libraries based on web standards

---

# What do you need to make a SPA (framework)?

- State management
- Rendering/templating
- Client-side routing

---

# State

- Component-bound state
    - Render hooks (React)
- Atomic state
    - Pull-based (signals)

<!-- Explain how @Observable uses the platform (TC-39 decorators) -->

---

# Component-Bound State

```ts {all|2|3|4}
function Counter() {
    let [count, setCount] = useState(0)
    console.log(count) // => 0
    document.addEventListener("click", () => setCount(count + 1)) // => `count` == 0
}
```

<!-- Calling setCount will cause the entire Counter function to re-run -->

---

# Component-Bound State: Under-the-Hood


```ts {all|2-3|5-7|all|10|10-11|all}
function useState(initialValue) {
    let component = useComponent()
    let hook = component.useCurrentHook()

    // We've already rendered this state
    // We can just return it
    if (hook.memoizedState) return hook.memoizedState

    function setState(newValue) {
        hook.memoizedState[0] = newValue
        component.invalidate()
    }

    // Initial render
    // Initialize the state with the initial value
    hook.memoizedState = [initialValue, setState]
    return hook.memoizedState
}
```

<!-- 
let states = new Map()

function useState(initialValue) {
    let component = useComponent()

    let state = undefined
    let stateKey = component.getKey()
    if (!state = states.get(stateKey)) {
        state = initialValue
        states.set(stateKey, initialValue)
    }

    let setState = (newValue) => {
        states.set(stateKey, newValue)
        component.invalidate()
    }

    return [state, setState]
}
-->

---

# Component-Bound State

```ts {all|2|3|4}
function Counter() {
    let [count, setCount] = useState(0)
    console.log(count) // => 1
    document.addEventListener("click", () => setCount(count + 1)) // => `count` == 1
}
```

---

# Atomic State

```ts
function Counter() {
    let [count, setCount] = createSignal(0)
    createEffect(() => console.log(count()))
    document.addEventListener("click", () => setCount(count() + 1))
}
```

---
transition: none
---

# Atomic State: Under-the-Hood

```ts
let context = []
```

<div class="flex flex-row gap-2">

<div class="w-full">


```ts
function createSignal(value) {
    let subscriptions = new Set()

    let read = () => {
        let observer = context[context.length - 1]
        if (observer) {
            subscriptions.add(observer)
            observer.dependencies.add(subscriptions)
        }
        return value
    }

    let write = (newValue) => {
        value = newValue
        for (let observer of [...subscriptions]) {
            observer.execute()
        }
    }

    return [read, write]
}
```

</div>
<div class="w-full">


```ts
function createEffect(fn) {
    let effect = {
        execute() {
            context.push(effect)
            fn()
            context.pop()
        },
        dependencies: new Set()
    }

    effect.execute()
}
```

</div>

</div>

---
transition: none
---

# Atomic State: Under-the-Hood

```ts {none}
let context = []
```

<div class="flex flex-row gap-2">

<div class="w-full">


```ts {4,5,7}
function createSignal(value) {
    let subscriptions = new Set()

    let read = () => {
        let observer = context[context.length - 1]
        if (observer) {
            subscriptions.add(observer)
            observer.dependencies.add(subscriptions)
        }
        return value
    }

    let write = (newValue) => {
        value = newValue
        for (let observer of [...subscriptions]) {
            observer.execute()
        }
    }

    return [read, write]
}
```

</div>
<div class="w-full">


```ts {4}
function createEffect(fn) {
    let effect = {
        execute() {
            context.push(effect)
            fn()
            context.pop()
        },
        dependencies: new Set()
    }

    effect.execute()
}
```

</div>

</div>

---
transition: none
---

# Atomic State: Under-the-Hood

```ts {none}
let context = []
```

<div class="flex flex-row gap-2">

<div class="w-full">


```ts {13,16}
function createSignal(value) {
    let subscriptions = new Set()

    let read = () => {
        let observer = context[context.length - 1]
        if (observer) {
            subscriptions.add(observer)
            observer.dependencies.add(subscriptions)
        }
        return value
    }

    let write = (newValue) => {
        value = newValue
        for (let observer of [...subscriptions]) {
            observer.execute()
        }
    }

    return [read, write]
}
```

</div>
<div class="w-full">


```ts {3,5,7}
function createEffect(fn) {
    let effect = {
        execute() {
            context.push(effect)
            fn()
            context.pop()
        },
        dependencies: new Set()
    }

    effect.execute()
}
```

</div>

</div>

---
transition: none
---

# Atomic State: Under-the-Hood

```ts {none}
let context = []
```

<div class="flex flex-row gap-2">

<div class="w-full">


```ts {none}
function createSignal(value) {
    let subscriptions = new Set()

    let read = () => {
        let observer = context[context.length - 1]
        if (observer) {
            subscriptions.add(observer)
            observer.dependencies.add(subscriptions)
        }
        return value
    }

    let write = (newValue) => {
        value = newValue
        for (let observer of [...subscriptions]) {
            observer.execute()
        }
    }

    return [read, write]
}
```

</div>
<div class="w-full">


```ts {11}
function createEffect(fn) {
    let effect = {
        execute() {
            context.push(effect)
            fn()
            context.pop()
        },
        dependencies: new Set()
    }

    effect.execute()
}
```

</div>

</div>

---

# Atomic State

```ts {all|3}
function Counter() {
    let [count, setCount] = createSignal(0)
    createEffect(() => console.log(count())) // => 1
    document.addEventListener("click", () => setCount(count() + 1))
}
```
---

# WebStd UI: Observable

- Mark a class as observable and each property will be backed by a signal
- Observe individual properties using `withObservationTracking(fn)`
- Uses TC-39 decorators, a platform-approved spec, slated to start landing in browsers next year 
- Uses Vue (`@vue/reactivity`) Refs under the hood

---

# WebStd UI: Observable

```ts {all|3,6|12-17|all|3}
import { Observable, withObservationTracking } from "@webstd-ui/observable"

@Observable 
class Book implements Identifiable {
    title = "Sample Book Title"
    @ObservationIgnored author = new Author()
    isAvailable = true
}

let book = new Book()

withObservationTracking(() => {
    console.log(book.title)
})

book.title = "New Title"
// => "New Title"
```

---

# WebStd UI: Observable

```ts {all|6|10-13|15|16-18|19-21}
import { ref } from "@vue/reactivity"

function Observable(Target, context) {
    return class Observed extends Target {
        constructor(...args: any[]) {
            let properties = Object.getOwnPropertyNames(this)
            for (let property of properties) {
                let refKey = Symbol(`__$${property}`)

                Object.defineProperty(this, refKey, {
                    value: ref(this[property]),
                    writable: true,
                })

                Object.defineProperty(this, property, {
                    get() {
                        return this[refKey].value
                    },
                    set(newValue) {
                        this[refKey].value = newValue
                    },
                })
            }
        }
    }
}
```

---


# WebStd UI: Observable

```ts {all|7-9,15|18-22}
import { Observable, withObservationTracking } from "@webstd-ui/observable"

@Observable 
class Library {
    books = [new Book(), new Book(), new Book()]
    
    get availableBooksCount() {
        return this.books.filter(book => book.isAvailable).length
    }
}

let library = new Library()

withObservationTracking(() => {
    console.log(library.availableBooksCount)
})

library.books[0].isAvailable = false
// => 2

library.books.push(new Book())
// => 3
```

---

# Rendering

- vDOM
- Dirty checking
- Fine grained reactivity

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

<div class="w-full h-full">

#### Current vDOM

```js
{ 











}
```

</div>

</div>

<div class="w-full">


```html
<div></div>
```

</div>

<!-- Goes through the process of pure rendering, creates a new structure each time, and then compares that structure with the previous version of the structure and then patches the diffs. A two pass approach. -->

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM


```js
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

<div class="w-full h-full">

#### Current vDOM


```js
{ 











}
```

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {2}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {2}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {3}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {3}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {5}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {5}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {7}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {7}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {8}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {8}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {11}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {11}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {12}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {12}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {12}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {12}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html {7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

</div>

---
transition: none
---

# Virtual DOM

Two pass data diffing approach

<div class="flex flex-row gap-2">

<div>

#### Updated vDOM

```js {12}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["true"] }]
}
```

</div>

<div class="w-full h-full">

<div>

#### Current vDOM

```js {12}
{
    type: "div",
    props: {},
    children: [{
        type: "div",
        children: [
            { type: "h1", children: ["Crying in H Mart"] },
            { type: "p", children: ["by Michelle Zauner"] }
        ]
    },
    { type: "h3", children: ["In Your Cart:"] },
    { type: "span", children: ["false"] }]
}
```

</div>

</div>

</div>

<div class="w-full">


```html {7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>true</span>
</div>
```

</div>

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: false,
}
```

```html
<div>
    <div>
        <h1></h1>
        <p></p>
    </div>
    <h3>In Your Cart:</h3>
    <span></span>
</div>
```

<!--
Dirty checking is single-pass data diff. 

We diff and mount the data initially...
-->

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js {2-4}
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: false,
}
```

```html {3-4,7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3>
    <span>false</span>
</div>
```

<!-- ...binding certain properties to certain elements in the DOM. -->

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: false,
}
```

```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3>
    <span>false</span>
</div>
```

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js {4}
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: true,
}
```

```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3>
    <span>false</span>
</div>
```

<!--
Then, when the data changes, because we have the previous data committed in the DOM from the last render, we just need to walk our data bindings and compare the data that exists to the new data as we go.
-->

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: true,
}
```

```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3>
    <span>false</span>
</div>
```

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js {2}
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: true,
}
```

```html {3}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3>
    <span>false</span>
</div>
```

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js {3}
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: true,
}
```

```html {4}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3>
    <span>false</span>
</div>
```

---
transition: none
---

# Dirty Checking

One pass data diffing approach

```js {4}
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: true,
}
```

```html {7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

<!--
When we find the data bindings that are dirty, we replace the content in the DOM with the updated data.
-->

---

# Dirty Checking

One pass data diffing approach

```js {4}
{
    title: "Crying in H Mart",
    author: "Michelle Zauner",
    inCart: true,
}
```

```html {7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>by Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>true</span>
</div>
```

---
transition: none
---

# Fine Grained Reactivity

No diff, direct updates

```html
<div>
    <div>
        <h1></h1>
        <p></p>
    </div>
    <h3>In Your Cart:</h3> 
    <span></span>
</div>
```


```ts
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```

<!-- 
    With fine-grained reactivity, we render out the static markup that won't change up front
    and grab references to the elements that might change. Then we use atomic reactive primitives,
    often refered to as signals, to update only the individual DOM node and its content, only when
    the data it depends on changes.
-->

---
transition: none
---

# Fine Grained Reactivity

No diff, direct updates

```html {3,4,7}
<div>
    <div>
        <h1></h1>
        <p></p>
    </div>
    <h3>In Your Cart:</h3> 
    <span></span>
</div>
```


```ts {9-11}
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```

---
transition: none
---

# Fine Grained Reactivity

No diff, direct updates

```html {3,4,7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>true</span>
</div>
```


```ts {9-11}
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```


---
transition: none
---

# Fine Grained Reactivity

No diff, direct updates

```html
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>true</span>
</div>
```


```ts
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```

---
transition: none
---

# Fine Grained Reactivity

No diff, direct updates

```html {none}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>true</span>
</div>
```

```ts {none}
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```

```ts {1}
inCart.set(false)
```

---
transition: none
---

# Fine Grained Reactivity

No diff, direct updates

```html {7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>true</span>
</div>
```

```ts {11}
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```

```ts {1}
inCart.set(false)
```

---

# Fine Grained Reactivity

No diff, direct updates

```html {7}
<div>
    <div>
        <h1>Crying in H Mart</h1>
        <p>Michelle Zauner</p>
    </div>
    <h3>In Your Cart:</h3> 
    <span>false</span>
</div>
```

```ts {11}
let h1: HTMLElement
let p: HTMLElement
let span: HTMLElement

let title = signal("Crying in H Mart")
let author = signal("Michelle Zauner")
let inCart = signal(true)

effect(() => { h1.textContent = title() })
effect(() => { p.textContent = author() })
effect(() => { span.textContent = inCart() })
```

```ts {1}
inCart.set(false)
```

---

# WebStd UI: View

- `lit-html` dirty checking via tagged template literals

```ts
import { html, render } from "lit-html"

const container = document.querySelector('#container')

const counterUI = (count) => html` 
    <span class="${count % 2 == 1 ? 'odd' : ''}">
        ${count}
    </span>
    <button @click=${() => render(counterUI(count + 1), container)}>
        Increment
    </button>
`

render(counterUI(0), container)
```

- Lit is efficent due to caching the static elements in the template
- Component-bound render effect for state updates

---

# WebStd UI: View

```ts {all|3}
import { CustomElement, View, State, html, EmptyView } from "@webstd-ui/view"

@CustomElement("app-counter")
export class Counter implements View {
    @State count = 0

    get body() {
        return html`
            <style>
                :host {
                    font-family: sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
            </style>
            <div>Counter</div>
            <button @click="${() => this.count++}">Count: ${this.count}</button>
            <span>${this.count % 2 === 0 ? html`Even Count!` : EmptyView()}</span>
        `
    }
}
```

---

# WebStd UI: View

```js {all|13-17|21}
import { withObservationTracking } from "@webstd-ui/observable"
import { render as diff } from "lit-html"

function CustomElement(tagName) {
    return (View, context) => {
        class ViewElement extends HTMLElement {
            view = new View()
            root = this.attachShadow({ mode: "open" })
            // ...

            connectedCallback() {
                // ...
                withObservationTracking(() => {
                    // Diff `view.body` with the shadow root and apply changes every
                    // time data that `view.body` depends on changes.
                    diff(this.view.body, this.root)
                })
            }
        }

        context.addInitializer(() => customElements.define(tagName, ViewElement))
    }
}
```


---

# What Else Do We Need For a Framework?

API design of the framework & other features needed to make a framework complete, provided by the platform

- Props
- Children
- Context

---

# Props

```ts {all|5|5,19}
import { CustomElement, View, Property, html } from "@webstd-ui/view"

@CustomElement("app-greeting")
export class Greeting implements View {
    @Property() name!: string

    get body() {
        return html`
            <h1>Greetings!</h1>
            <span>Hello, ${this.name}!</span>
        `
    }
}

@CustomElement("app-main")
export class Main implements View {
    get body() {
        return html`
            <app-greeting .name="Remix Meetup"></app-greeting>
        `
    }
}
```

---

# Children

We get this for free because of the platform!

<div class="flex flex-row gap-2">


```ts {all|12}
@CustomElement("app-card")
export class Card implements View {
    get body() {
        return html`
            <style>
                :host {
                    background-color: white;
                    border: solid;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                }
            </style>
            <slot></slot>
        `
    }
}
```

<div class="w-full">

```ts {none|all|7-10}
@CustomElement("app-tag")
export class Tag implements View {
    @Property() name!: string

    get body() {
        return html`
            <app-card>
                <i class="icon icon-tag"></i>
                <span>${this.name}</span>
            </app-card>
        `
    }
}
```

</div>
</div>

---

# Context

```ts {all|2|all}
const LibraryKey = new EnvironmentKey<Library>({
    key: "env-library",
    defaultValue: undefined,
})
```

```ts {none|all|3}
@CustomElement("app-bookshelf")
export class Bookshelf implements View {
    @Environment(LibraryKey) library?: Library

    get body() {
        return html`Books Available: ${this.library?.availableBooksCount}`
    }
}
```

```ts {none|all|3,6}
@CustomElement("app-main")
export class Main implements View {
    library = new Library()

    get body() {
        return html`<env-library .value="${this.library}">
            <app-bookshelf></app-bookshelf>
        </env-library>`
    }
}
```

---

# Routing

Fundamental features for good single-page routing

- Single-page navigation
- Nested routes
- Parallel data loading
- Form actions & invalidation

---

# Single-Page Navigation

<div class="flex justify-center h-[96%]">
    <video autoplay="true" loop="true">
        <source src="/spa-nav.mov" type="video/mp4" />
    </video>
</div>

---
transition: none
---

# Nested Routes

<div class="flex justify-center h-[96%]">
    <img class="object-contain" src="/nested-routes-root-1.png">
</div>

---
transition: none
---

# Nested Routes

<div class="flex justify-center h-[96%]">
    <img class="object-contain" src="/nested-routes-sales-2.png">
</div>

---
transition: none
---

# Nested Routes

<div class="flex justify-center h-[96%]">
    <img class="object-contain" src="/nested-routes-invoices-3.png">
</div>

---
transition: none
---

# Nested Routes

<div class="flex justify-center h-[96%]">
    <img class="object-contain" src="/nested-routes-invoice-4.png">
</div>

---

# Parallel Data Loading

<video autoplay="true" loop="true">
  <source src="/parallel-loading.mov" type="video/mp4" />
</video>

---

# Form Actions & Invalidation

<video autoplay="true" loop="true">
  <source src="/form-actions.mov" type="video/mp4" />
</video>

---

# Routing, Cont'd.

- Remix has all these features, React Router does too, it’s based on Remix Router
- Remix Router has been ported to multiple frameworks

<v-click>

- Now it’s available for WebStd UI!

</v-click>

<!-- Explain how @remix-run/router uses the platform -->
---
transition: none
---

# WebStd UI: Router

```ts {all|3-12|14-19|16|17}
@CustomElement("todo-app")
export class App implements View {
    routes: RouteObject[] = [
        {
            path: "/",
            template: html`<app-tasks></app-tasks>`,
            children: [
                { path: ":id", template: html`<app-task></app-task>` },
                { path: "new", template: html`<app-new-task></app-new-task>` },
            ],
        },
    ]

    get body() {
        return html`<env-router
            .routes=${this.routes}
            .fallback=${html`<p>Loading...</p>`}
        ></env-router>`
    }
}
```

---
transition: none
---

# WebStd UI: Router

```ts {all|6-7}
@CustomElement("todo-app")
export class App implements View {
    routes: RouteObject[] = [
        {
            path: "/",
            loader: tasksLoader,
            action: tasksAction,
            template: html`<app-tasks></app-tasks>`,
            children: [...],
        },
    ]

    get body() {
        return html`<env-router
            .routes=${this.routes}
            .fallback=${html`<p>Loading...</p>`}
        ></env-router>`
    }
}
```

---

# WebStd UI: Router

```ts
import { getTasks } from "./db"

export async function loader() {
    let tasks = await getTasks()
    return json({ tasks })
}
```

```ts
import { deleteTask } from "./db"

export async function action({ request }) {
    let formData = await request.formData()
    await deleteTask(formData.get("taskId"))
    return null
}
```

---

# WebStd UI: Router

```ts {all|3|5-7|18|19}
@CustomElement("app-tasks")
export class Tasks implements View {
    @UseRouter() router!: Router

    get tasks(): Task[] {
        return this.router.loaderData()?.tasks ?? []
    }

    get body() {
        return html`
            <h2>Tasks</h2>
            <ul>
                ${ForEach(
                    this.tasks,
                    task => html`<li><app-task-item .taskItem=${task}></app-task-item></li>`
                )}
            </ul>
            <a href="/tasks/new" ${this.router.enhanceLink()}>Add New Task</a>
            <router-outlet></router-outlet>
        `
    }
}
```

---

# WebStd UI

<div class="flex justify-center items-center">
    <img class="object-contain h-[50%]" src="/hibiscus_3d.png">
</div>


---

<!-- # Challenges

- Shadow DOM: scoped styles and slots come with complete encapsulation, which is not always what you want; plus shadow roots make dev tools worse IMO
- Asynchronous context: because event listeners have to communicate with callbacks, context starts as undefined and the effect gets an initial value of undefined, but we want to hold that effect starting until all our contexts are settled so our contexts are never undefined unless we explicitly provide undefined as the value -->

<!-- # Features I Want to Add

- Error boundaries
- Suspense/asyncronous rendering
- Hot module reloading (similar to SwiftUI's `#Preview` macro)
- VS Code extension
- Unstyled components
- Server-side rendering (and a meta-framework...? 😏)

-->

# Don't Use This

- WebStd UI is alpha software. But the concepts are good and live on in production-ready software. You should use Solid, Lit, and/or Remix.

<v-click>

<br />

## But... You can help me build it! PR's are welcome.

<div class="flex flex-row items-center gap-3">

<img src="/hibiscus_3d.png" alt="webstd-ui-logo" class="w-10 h-10">

https://github.com/webstd-ui

</div>

</v-click>

---

# Why Make Your Own Framework?
<v-click>

- You can learn a lot about how other frameworks and their primitives work by creating your own framework

</v-click>
<v-click>

- It’s surprisingly easy to create your own framework nowadays, because the platform provides a lot of functionality for writing component-based apps

</v-click>
<v-click>

- It's fun to create a framework that works exactly the way you want as an expression of yourself

</v-click>

---

# Questions?

<div class="flex h-full justify-center items-center">
    <img src="/any-questions.gif" class="h-full object-cover pb-10">
</div>
