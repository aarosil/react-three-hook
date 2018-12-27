# React Hooks + Three.js

## Motivation/Background
With three.js, you need to instantiate several objects each time you use it. You need to create a Scene, a camera, a renderer, some 3D objects, and maybe a canvas. Beyond that, if you need controls, maybe you setup [`DAT.gui`](https://github.com/dataarts/dat.gui) like the examples use.

The renderer needs a reference to the camera and the Scene. You need a reference to the Scene to add any 3D objects you create. For camera controls you need reference to the canvas DOM element. It's up to you how to structure everything cleanly.

In contrast, React devs are now used to the ease and simplicity of using `create-react-app` to try things out. It would be great to have a React component you could throw some random three.js code into and have it work!

Taking the idea further, what if we could model three.js scene objects like React components and write code like this:

```html
<Scene>
  <cameraControls />
  <Cube h={12} w={12} d={12} />
</Scene>
```

The pattern I explain below aims to allow this in a very minimally obtrusive way.

## What is the end result?
- A component: `ThreeJSManager`
- A custom hook: `useThree`

Combining them allows you to create React-ish three.js components without losing any control of three.js

## API

### `ThreeJSManager`:
This component takes 3 props:
- `getCamera` _(Function)_: Function that returns a three.js `Camera`. Function called with a `canvas` element
- `getRenderer` _(Function)_: Function that returns a three.js `Renderer`. Function called with a `canvas` element
- `getScene` _(Function)_: Function that returns a three.js `Scene`.

The output of these functions, along with a `canvas` and `timer`, are made available in a React `Context`. Any of the components you add the `useThree` hook to need to be a child of this component.

### `useThree` Custom Hook:
```
useThree(setup, [destroy])
```
`useThree` custom hook relies on the context provided by `ThreeJSManager`, so it can only be used in components that have `ThreeJSManager` as an ancestor.

Arguments:
- `setup` _(Function)_: This function will be called when the component mounts. It gets called with the context value provided by `ThreeJSManager`. This function is where you setup the 3D objects to use in your component. Whatever you return here will be available to you later as the output of the `getEntity` function, which is on the object returned by `useThree`.
- `destroy` _(Function)_: Optional. This function will be called when the component is unmounted. It gets called with 2 arguments: the context values provided by `ThreeJSManager`, and a reference to whatever you returned from `setup`. If the `destroy` param isn't passed, `scene.remove` is called with the return value of `setup` by default. _**Note**: the return value of `setup` is the same as the output of `getEntity` described below_

Returns: _(Object)_

`useThree` returns an object which has all the values from the context provided by `ThreeJSManager`, and a `getEntity` function which returns a reference to the return value of the `setup` function. Whatever is returned from `setup` is stored internally inside the hook for you to access with `getEntity` whenever you need to, ie when props change.

## How does it work? React Hooks.

There are a few features in React 16.x that make using three.js (or any external library) in a React app a lot cleaner. Those are [`forwardRef`](https://reactjs.org/docs/forwarding-refs.html), and some of the new, experimental [Hooks](https://reactjs.org/docs/hooks-intro.html): [`useRef`](https://reactjs.org/docs/hooks-reference.html#useref), and most importantly [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useeffect).

Read the docs above, but in a nutshell what the features allow is the ability to create function components which:

- Use `useEffect` to configurably run arbitrary JS (such as calling a third party library)
- Use `useRef` to store a reference to any arbitrary value (such as third-party classes)
- Combine the above with `forwardRef` to create a component that makes any arbitrary reference available to it's parent

Here is how you could use these hooks to make a `Cube` functional component:

```js
function Cube = (props) {
  const entityRef = useRef()
  const scene = getScene()

  useEffect(
    () => {
      entityRef.current = createThreeJSCube(scene, props)
      return () => {
        cleanupThreeJSCube(scene, entityRef.current)
      }
    },
    [],
  )

  return null
}
```

Ignoring for now where the component gets `scene` from, what we've done is created a React component, which, when mounted, calls `createThreeJSCube` and stores a reference to the return value, and when unmounted, calls `cleanupThreeJSCube`. It renders `null`, so doesn't effect the DOM; it *only* has side effects. Interesting.

In case you haven't read up on `useEffect` yet, the 2nd argument is the hook's dependencies, by specifying an empty array, we're indicating this hook doesn't have dependencies and should only be run once. Omitting the argument indicates it should be run on every render, and adding references into the array will cause the hook to run only when the references have changed.

Using this knowledge, we can add a second hook to our `Cube` component to run some effects when props change. Since we stored the output from our three.js code into `entityRef.current`, we can now access it from this other hook:

```js
function Cube(props) {
  …
  useEffect(
    () => {
      updateCubeWithProps(entityRef.current, props)
    },
    [props]
  )
}
```

We now have a React component which adds a 3D object to a three.js scene, alters the object when it gets new props, and cleans itself up when we unmount it. Awesome! Now we just need to make `scene` available in our component so that it actually works.

## `forwardRef`

Before discussing how we get `scene` available in our component, let's discuss another newer React feature that will help us setup three.js in the way we need: `forwardRef`. Remember, before we can even get to adding 3D objects to the `scene`, we still need to setup our canvas, renderer, camera, and all of that.

Consider the fact that, in three.js, several things need reference to the `canvas` element. In more vanilla usages this `canvas` is created by THREE code itself, but we want more control, so we're going to render it from a React component so we can encapsulate resize actions and anything else specific to the canvas in that component. Now we have a problem though, in that, the DOM element is only available in that component. How do we solve this? `forwardRef`! With `forwardRef`, we can create a `Canvas` component, that renders a canvas element, and forwards it's ref to it. So anyone for anyone rendering `<Canvas ref={myRef} />`, `myRef` will point to the `canvas` HTML element itself, not the `Canvas` React component. Cool!

```js
const Canvas = forwardRef((props, ref) => {
  …
  return (
    <canvas ref={ref} … />
  )
})
```

Also remember that, from the React docs, `ref`s are not just for DOM element references! We could set and forward a `ref` to any value.

## `ThreeJSManager` Component

Using the above techniques, we can create a `ThreeJSManager` component that has `ref`s to everything we need to use three.js: we'll pass it functions that return the `camera`, `renderer`, `scene` objects, and we'll use our `Canvas` component to reference the `canvas` DOM element.

However, we'll still need to make these objects available to child components. For this, we'll have `ThreeJSManager` render a `Context.Provider` with all these values. Most components will only need `scene`, but the `canvas` and `camera` object will be useful for components that render for example camera controls.

Now with the context `Provider` setup, we can use the `useContext` hook to access the scene in our React/three.js components:

```js
function Cube = (props) {
  const context = useContext(ThreeJSContext)
  const { scene } = context
  …
}
```

In a nutshell, `ThreeJSManager` abstracts away the base-level three.js tasks you need to do to before you can add 3D objects. Here's how its return value might look:

```html
<ThreeJSContext.Provider
  value={{
    scene,
    camera,
    canvas,
  }}
>
  { props.children }
</ThreeJSContext.Provider>
```

And here's how we might use it in our app:
```html
<SceneManager
  getCamera={getCamera}
  getRenderer={getRenderer}
  getScene={getScene}
>
  <Ground />
  <Lights />
  <CameraControls />
  <Cube color={Number(`0x${color}`)} />
</SceneManager>
```

With `Ground`, `Lights`, `CameraControls`, and `Cube` being components that make use of the `useThree` hook.

## `useThree` Custom Hook
Let's look at what `useThree` does:

- Accesses the `scene` and other three.js objects with `useContext`
- Initializes a placeholder that will store the 3D object with `useRef` (`entityRef`) 
- Runs code on mount that instantializes the 3D object, assigns it to `entityRef`, adds it to the `scene`, and returns a cleanup function that removes it from `scene` with `useEffect`
- Returns an object with a `getEntity` function that can be used in other effects (such as when props change) to update the 3D object.

Here's the code for our custom hook:

```js
import { ThreeJSContext } from './ThreeJSManager';

const useThree = (setup, destroy) => {
  const entityRef = useRef();
  const context = useContext(ThreeJSContext);

  const getEntity = () => entityRef.current;

  useEffect(
    () => {
      entityRef.current = setup(context);

      return () => {
        if (destroy) {
          return destroy(context, getEntity());
        }
        context.scene.remove(getEntity());
      };
    },
    [],
  );

  return {
    getEntity,
    ...context,
  };
}
```

Here's how you'd use it to add a simple grid object to the scene:

```js
const Grid = () => {
  useThree(({ scene }) => {
    const grid = new THREE.GridHelper(1000, 100);
    scene.add(grid);

    return grid;
  });

  return null;
};
```

Notice a few things here:
- Our `setup` param method signature destructures `scene` since that's all we care about
- We didn't pass `destroy` param, so `useThree` will just call `scene.remove` with `grid`, since that's what we returned from `setup`.
- The component renders `null`, otherwise React will throw an error.
- We don't care about props changing, so we don't store the return value of `useThree` (which would give us access to `grid` object through `getEntity`).

If we did care about the props changing, we could destructure `getEntity` from the return value of `useThree` and use it in another effect that triggers when props change:

```js
const Grid = props => {
  const { color } = props
  const { getEntity } = useThree(…)

  useEffect(
    () => {
      const grid = getEntity()
      grid.material.color.set(color)
    },
    [color],
  )
  …
}
```

If we wanted to do something specific on unmount, we can pass a `destroy` function as the 2nd argument. Perhaps our component is complex and has several three.js objects and our `setup` function returned an object containing all of them:
```js
const ComplexThreeComponent = () => {
  const getEntity = useThree(
    ({ scene }) => {
      …
      return {
        arms,
        body,
        leg,
      }
    },
    ({ scene }, entity) => {
      const { arms, body, leg } = entity
      scene.remove(arms)
      scene.remove(body)
      scene.remove(leg)
    }
  })
  …
};
```

If we want to setup a camera control, we can create a component that uses `camera` and `canvas` in its `setup` function:

```js
const CameraControls = () => {
  useThree(({ camera, canvas }) => {
    const controls = new OrbitControls(camera, canvas)
    …
  })
  …
}
```

## Animations / `requestAnimationFrame`
`ThreeJSManager` has a component state variable called `timer` which it provides on the context. We can create effects that use this, same as what we've already done for props. Here's how it looks to rotate our simple cube:

```js
const Cube = props => {
  const { getEntity, timer } = useThree(…)

  useEffect(
    () => {
      const cube = getEntity()
      cube.rotation.x += .01
      cube.rotation.z += .01
    },
    [timer],
  )
  …
}
```

## Summary
At a high level what we've done is created React components that don't render anything and *just* have side effects, in this case side effects all relating to calling the three.js library, but the same concept could be applied to anything.

To manage the framework of side effects we created a component which provides a bunch of objects in a React `Context` that we can perform our side effects on.

We used React's new experimental hooks feature to separate the concerns of the different side effects, and control when each gets run with a high level of granularity. We have could have achieved similar results with the classic lifecycle methods, but not as declaratively.


## Known Limitations
- Currently there's no way to switch the `scene` outside of rendering a different `ThreeJSManager` component
- Changing the props for `ThreeJSManager` doesn't have any effect since it only uses them on mount
- The scene is always rerendered with `requestAnimationFrame`, it's needed for the props changing on a `useThree` component to take effect.
- The function passed to `requestAnimationFrame` doesn't actually trigger the `timer` effects in our components directly, so profiling the rendering performance could be harder

## Caveat

This is mostly an experiment to see what can be done with the new React hooks, but not intended for production-level use, given the "experimental" status of hooks.

## Inspiration
- [How to use plain Three.js in your React apps](https://itnext.io/how-to-use-plain-three-js-in-your-react-apps-417a79d926e0)