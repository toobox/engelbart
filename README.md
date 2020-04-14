# engelbart
A plug and play `Trackball`

This repository was spun off of [Claude](https://github.com/bb-labs/claude) as a standalone npm module. It's completely dependency free and thus can be dropped right into any graphics application.
A trackball is a way to conveniently rotate data around a point. By assuming our data lies within a virtual sphere, we can trace rays from a camera point and observe their intersections. Once we've established an intersection point, dragging the mouse along our sphere
creates an arc. At the end of this arc, we create another vector normal to the surface. The cross product of these two vectors defines the axis of our rotation. We can then construct the relevant rotation matrix.

[Quaternions](https://en.wikipedia.org/wiki/Quaternion) are useful here as they allow us to compose rotations. Each rotation can be represented by a unit quaternion and composition (one rotation after another) simply reduces to multiplying quaternions together.   

```sh
npm install engelbart
```

```js
import Trackball from 'engelbart'

const trackball = new Trackball()
```

We assume here that the trackball is part of a class, and that the following are event handlers. The is the canonical usage:

```js
pointerdown(event) {
    /** Pressed */
    this.pointer = true

    /** Convert Click to Screen-Space Coordinates */
    const [x, y] = this.rasterToScreen(event.x, event.y)

    /** Cast a Ray using Screen-Space Coordinates */
    const ray = this.camera.cast(x, y)

    /** Point of Intersection */
    const point = this.trackball.intersect(ray)

    /** Start the Trackball */
    this.trackball.play(point)
}

pointermove(event) {
    /** Not Pressed? */
    if (!this.pointer) return

    /** Convert Click to Screen-Space Coordinates */
    const [x, y] = this.rasterToScreen(event.x, event.y)

    /** Cast a Ray using Screen-Space Coordinates */
    const ray = this.camera.cast(x, y)

    /** Point of Intersection */
    const point = this.trackball.intersect(ray)

    /** Track the Mouse-Movement along the Trackball */
    this.trackball.track(point)
}

pointerup() {
    /** Released */
    this.pointer = false

    /** Keep the Trackball at the Released Position */
    this.trackball.pause()
}

```


