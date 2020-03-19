
export default class Trackball {
    constructor({
        radius = 2,
        origin = [0, 0, 0],
    }) {
        /** Properties of the Trackball */
        this.radius = radius
        this.origin = new Float32Array(origin)

        /** Quaternions for the Trackball */
        this.rotation = new Float32Array([1, 0, 0, 0])
        this.orientation = new Float32Array([1, 0, 0, 0])
        this.intermediate = new Float32Array([1, 0, 0, 0])

        /** Begin Tracking from Clicked Location */
        this.start = new Float32Array(3)

        /** Model Matrix for the Trackball */
        this.model = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ])
    }

    intersect(ray) {
        /** Dummy Variables */
        const o = this.origin

        const ox = ray[0]; const dx = ray[3]
        const oy = ray[1]; const dy = ray[4]
        const oz = ray[2]; const dz = ray[5]

        /** Origin of Ray Minus Origin of Trackball */
        const tx = ox - o[0]
        const ty = oy - o[1]
        const tz = oz - o[2]

        /** Constants A, B, C of Quadratic Polynomial  */
        const a = dx ** 2 + dy ** 2 + dz ** 2
        const b = 2 * (dx * tx + dy * ty + dz * tz)
        const c = tx ** 2 + ty ** 2 + tz ** 2 - this.radius ** 2

        /** Solve Quadratic Equation */
        const discriminant = b ** 2 - 4 * a * c

        if (!discriminant) return [-0.5 * b / a, -0.5 * b / a]

        const q = (b > 0) ?
            -0.5 * (b + Math.sqrt(discriminant)) :
            -0.5 * (b - Math.sqrt(discriminant))

        /** Roots */
        const t0 = c / q
        const t1 = q / a

        /** Intersection Points */
        return [
            /** Near */
            dx * t0 + tx,
            dy * t0 + ty,
            dz * t0 + tz,

            /** Far */
            dx * t1 + tx,
            dy * t1 + ty,
            dz * t1 + tz,
        ]
    }

    track(point) {
        /** Dummy Variables */
        const p = point
        const m = this.model
        const s = this.start
        const r = this.rotation
        const o = this.orientation
        const i = this.intermediate

        /** Norm of Start and Pointer */
        const sn = Math.sqrt(s[0] ** 2 + s[1] ** 2 + s[2] ** 2)
        const pn = Math.sqrt(p[0] ** 2 + p[1] ** 2 + p[2] ** 2)

        /** Create Unit Axis of Rotation */
        let ax = s[1] * p[2] - s[2] * p[1]
        let ay = s[2] * p[0] - s[0] * p[2]
        let az = s[0] * p[1] - s[1] * p[0]

        const inverseNorm = 1 / Math.sqrt(ax ** 2 + ay ** 2 + az ** 2)

        ax *= inverseNorm
        ay *= inverseNorm
        az *= inverseNorm

        /** Angle between Start and Pointer */
        const angle = Math.acos((s[0] * p[0] + s[1] * p[1] + s[2] * p[2]) / (sn * pn))

        /** Small Angles Occasionally Divide by Zero */
        if (isNaN(angle)) return

        /** Construct Quaternion to Represent Rotation */
        i[0] = Math.cos(angle / 2)
        i[1] = Math.sin(angle / 2) * ax
        i[2] = Math.sin(angle / 2) * ay
        i[3] = Math.sin(angle / 2) * az

        /** Apply Rotation via Quaternion Multiplication */
        r[0] = i[0] * o[0] - i[1] * o[1] - i[2] * o[2] - i[3] * o[3]
        r[1] = i[1] * o[0] + i[0] * o[1] + i[2] * o[3] - i[3] * o[2]
        r[2] = i[0] * o[2] - i[1] * o[3] + i[2] * o[0] + i[3] * o[1]
        r[3] = i[0] * o[3] + i[1] * o[2] - i[2] * o[1] + i[3] * o[0]

        /** Transform Quat To Model Matrix */
        m[0] = 1 - 2 * r[2] * r[2] - 2 * r[3] * r[3]
        m[1] = 2 * r[1] * r[2] + 2 * r[3] * r[0]
        m[2] = 2 * r[1] * r[3] - 2 * r[2] * r[0]

        m[4] = 2 * r[1] * r[2] - 2 * r[3] * r[0]
        m[5] = 1 - 2 * r[1] * r[1] - 2 * r[3] * r[3]
        m[6] = 2 * r[2] * r[3] + 2 * r[1] * r[0]

        m[8] = 2 * r[1] * r[3] + 2 * r[2] * r[0]
        m[9] = 2 * r[2] * r[3] - 2 * r[1] * r[0]
        m[10] = 1 - 2 * r[1] * r[1] - 2 * r[2] * r[2]
    }

    play(point) {
        /** Dummy Variables */
        const p = point
        const s = this.start

        s[0] = p[0]
        s[1] = p[1]
        s[2] = p[2]
    }

    pause() {
        /** Dummy Variables */
        const r = this.rotation
        const o = this.orientation

        /** Assign New Orientation from Last Rotation */
        o[0] = r[0]
        o[1] = r[1]
        o[2] = r[2]
        o[3] = r[3]
    }
}
