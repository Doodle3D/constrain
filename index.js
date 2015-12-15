import test from 'tape';
import 'tap-dev-tool/register';
import {Matrix, Vector, Utils as CALUtils} from 'CAL';
const clamp = CALUtils.MathExtended.clamb;

class BoundingBox {
  constructor(minX, minY, maxX, maxY) {
    this.min = new Vector(minX, minY);
    this.max = new Vector(maxX, maxY);
  }
  get width() {
    return this.max.x-this.min.x;
  }
  get height() {
    return this.max.y-this.min.y;
  }
  get x() {
    return this.min.x;
  }
  get y() {
    return this.min.y;
  }
}

function constrain(bounds, space) { 
	const scaleX = space.width/bounds.width;
  const scaleY = space.height/bounds.height;
  const scale = Math.min(scaleX, scaleY, 1);
  
  const width = bounds.width*scale;
  const height = bounds.height*scale;
  
  const minX = space.min.x;
  const maxX = space.max.x-width;
  const minY = space.min.y;
  const maxY = space.max.y-height;
  const x = clamp(bounds.x, minX, maxX);
  const y = clamp(bounds.y, minY, maxY);
  
  return new Matrix({x, y, sx: scale, sy: scale});
}

const space = new BoundingBox(-200, -200, 200, 200);

test('when bounds fit', (assert) => {
	const bounds = new BoundingBox(-100, -100, 100, 100);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: bounds.x, y: bounds.y, sx: 1, sy: 1});
	assert.deepEqual(actual, expected, 'should not move or scale bounds');
	assert.end();
})

test('when bounds fit but to far left', (assert) => {
  const bounds = new BoundingBox(-210, -100, -10, 100);
	const actual = constrain(bounds, space);
  const expected = new Matrix({x: space.min.x, y: bounds.y, sx: 1, sy: 1});
	assert.deepEqual(actual, expected, 'should limit x to left side');
	assert.end();
})
test('when bounds fit but to far right', (assert) => {
	const bounds = new BoundingBox(10, -100, 210, 100);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: space.max.x-bounds.width, y: bounds.y, sx: 1, sy: 1});
	assert.deepEqual(actual, expected, 'should limit x to right side');
	assert.end();
})


test('when bounds fit but to high', (assert) => {
  const bounds = new BoundingBox(-100, -210, 100, -10);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: bounds.x, y: space.min.y, sx: 1, sy: 1});
	assert.deepEqual(actual, expected, 'should limit y to top');
	assert.end();
})
test('when bounds fit but to low', (assert) => {
  const bounds = new BoundingBox(-100, 10, 100, 210);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: bounds.x, y: space.max.y-bounds.height, sx: 1, sy: 1});
	assert.deepEqual(actual, expected, 'should limit y to bottom');
	assert.end();
})

test('when bounds to tall', (assert) => {
  const bounds = new BoundingBox(-100, -100, 100, 700);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: bounds.x, y: space.min.y, sx: 0.5, sy: 0.5});
	assert.deepEqual(actual, expected, 'should limit Y to top, scale down');
	assert.end();
})

test('when bounds to wide', (assert) => {
  const bounds = new BoundingBox(-100, -100, 700, 100);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: space.min.x, y: bounds.y, sx: 0.5, sy: 0.5});
  assert.deepEqual(actual, expected, 'should limit X to left, scale down');
	assert.end();
})

test('when bounds to tall and wide', (assert) => {
  const bounds = new BoundingBox(-100, -100, 700, 700);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: space.min.x, y: space.min.y, sx: 0.5, sy: 0.5});
  assert.deepEqual(actual, expected, 'should limit X and Y to top left, scale down');
	assert.end();
})

test('when bounds to tall and wide and centered', (assert) => {
  const bounds = new BoundingBox(-400, -400, 400, 400);
	const actual = constrain(bounds, space);
	const expected = new Matrix({x: space.min.x, y: space.min.y, sx: 0.5, sy: 0.5});
  assert.deepEqual(actual, expected, 'should correct X and Y to top left, scale down');
	assert.end();
})
