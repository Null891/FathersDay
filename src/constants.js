// Single source of truth for hallway geometry — imported by Museum (to build
// the room) and Player (to clamp movement inside it).

export const HALL_WIDTH  = 6
export const HALL_HEIGHT = 4
export const HALL_LENGTH = 160
export const HALL_HALF_Z = HALL_LENGTH / 2

export const CENTER_Z = -(HALL_HALF_Z - 2)        // -78  (floor centre)
export const FRONT_Z  = CENTER_Z + HALL_HALF_Z    //   2  (open entrance edge)
export const BACK_Z   = CENTER_Z - HALL_HALF_Z + 2 // -156 (end wall)

export const EYE_HEIGHT = 1.6

// Movement bounds — keep the camera off the walls and out of the void.
export const WALL_MARGIN = 0.5
export const MIN_X = -(HALL_WIDTH / 2 - WALL_MARGIN)   // -2.5
export const MAX_X =  (HALL_WIDTH / 2 - WALL_MARGIN)   //  2.5
export const MIN_Z = BACK_Z + 1.5                       // just shy of end wall
export const MAX_Z = FRONT_Z - 0.5                      // just inside entrance
