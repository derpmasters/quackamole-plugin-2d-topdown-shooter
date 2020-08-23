class CollisionUtils {
    static rectRect = (entityA, entityB) => {
        return entityA.x + entityA.w / 2 > entityB.x - entityB.w / 2 &&
               entityA.x - entityA.w / 2 < entityB.x + entityB.w / 2 &&
               entityA.y + entityA.h / 2 > entityB.y - entityB.h / 2 &&
               entityA.y - entityA.h / 2 < entityB.y + entityB.h / 2;
    }

    static pointRect = (point, entityB) => {
        return point[0] > entityB.x - entityB.w / 2 &&
               point[0] < entityB.x + entityB.w / 2 &&
               point[1] > entityB.y - entityB.h / 2 &&
               point[1] < entityB.y + entityB.h / 2;
    }


    static pointCircle(px, py, cx, cy, r) {
        // http://www.jeffreythompson.org/collision-detection/point-circle.php
        // get distance between the point and circle's center using the Pythagorean Theorem
       const distX = px - cx;
       const distY = py - cy;
       const distance = Math.sqrt( (distX*distX) + (distY*distY) );

      // if the distance is less than the circle's radius the point is inside!
      return distance <= r;
    }

    static circleCircle(c1x, c1y, c1r, c2x, c2y, c2r) {
      // get distance between the circle's centers use the Pythagorean Theorem to compute the distance
      const distX = c1x - c2x;
      const distY = c1y - c2y;
      const distance = Math.sqrt( (distX*distX) + (distY*distY) );

      // if the distance is less than the sum of the circle's radii, the circles are touching!
      return distance <= c1r + c2r;
    }

    static circleRect(entityCircle, entityRect) {
        // Find the closest point to the circle within the rectangle
        const closestXY = VectorUtils.clamp(entityCircle.XY, [entityRect.left, entityRect.top], [entityRect.right, entityRect.bottom]);

        // Calculate the distance between the circle's center and this closest point
        const distanceXY = VectorUtils.relativeVector(entityCircle.XY, closestXY);

        // If the distance is less than the circle's radius, an intersection occurs
        const distanceSquared = (distanceXY[0] * distanceXY[0]) + (distanceXY[1] * distanceXY[1]);
        return distanceSquared < (entityCircle.radius * entityCircle.radius);
    }
}
