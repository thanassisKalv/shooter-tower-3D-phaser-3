var config = {
    type: Phaser.WEBGL,
    parent: 'content',
    width: 1.6*800,
    height: 1.6*600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var text;
var camera;
var cursors;
var transform1;
var transform2;
var transform3;
var xAxis;
var yAxis;
var zAxis;
var isPosition = true;
var tomatoSphere;
var innerSphere;
var towerGun;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.scenePlugin('Camera3DPlugin', 'plugins/camera3d.min.js', 'Camera3DPlugin', 'cameras3d');

    this.load.spritesheet('kaboom', 'assets/explode-small.png', {frameWidth: 64, frameHeight: 64});
    
    // assets for the orbitting spheres
    this.load.image('sphere', 'assets/aqua_ball.png');
    this.load.image('sphere2', 'assets/tomato-sphere.png');

    // asset for rotating gun
    this.load.image('tower-gun', 'assets/glow-gun.png');

    // frames for the bullet animation
    this.load.image('bullet', 'assets/glow-shot.png');
    this.load.image('bullet2', 'assets/glow-shot-small.png');
    this.load.image('bullet3', 'assets/glow-shot-done.png');
}

function create ()
{
    _this = this;
    graphics = this.add.graphics();

    // bomb animation - could not make this work on the Sprite-3D that why I used time.addEvent({...}) for animations
    // this.anims.create({ 
    //     key: 'explode', 
    //     frames: this.anims.generateFrameNumbers( 'kaboom', { start: 0, end: 15 }), 
    //     frameRate: 16, repeat: 0, 
    //     hideOnComplete: true
    // });
    // explosions = this.add.group({defaultKey:'kaboom', maxSize: 60});

    camera = this.cameras3d.add(100).setPosition(0, 200, 550).setPixelScale(16);

    innerSphere = camera.createMultiple(5, 'sphere');
    camera.randomSphere(120, innerSphere);

    tomatoSphere = camera.createMultiple(80, 'sphere2');
    camera.randomSphere(300, tomatoSphere);

    camera.createRect({x:2,y:2,z:10}, 10, 'sphere');

    //console.log(sprites3);
    towerGun = camera.createRect({x:2, y:2, z:1}, 15, 'tower-gun');
    towerGun.forEach(function(tmt){
        tmt.z = 65;
        console.log(tmt);
    })
    var lastTomato = towerGun[3];


    //  rotation matrices for the orbit animations
    transform1 = new Phaser.Math.Matrix4();
    transform1.rotateZ(0.015);
    transform2 = new Phaser.Math.Matrix4();
    transform2.rotateZ(0.03);
    transform3 = new Phaser.Math.Matrix4();
    transform3.rotateZ(0.05);

    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
    
        var ball2Explode = tomatoSphere[Math.floor(Math.random() * tomatoSphere.length)];
        var gun = towerGun[Math.floor(Math.random() * towerGun.length)];

        glowshot(gun, ball2Explode)
        _this.time.addEvent({
            delay: 130,
            callback: sphereExplode(ball2Explode)
        });

    }, this);


    function sphereExplode(ball2Explode){
        if(ball2Explode.exploded==true)
            return;
        ball2Explode.gameObject.setTexture('kaboom', 4)
        var counter = 4;
        _this.time.addEvent({
            delay: 100,
            callback: function(){
                counter++;
                ball2Explode.gameObject.setTexture('kaboom', counter)
            },
            repeat: 10
        });
        ball2Explode.exploded = true;
    }

    /*  
     * fbl : firing bullet
     * tbl : target bullet  */
    function glowshot(fbl, tbl){
        if(tbl.exploded==true)
            return;

        var counter = 0
        _this.time.addEvent({
            delay: 14,
            callback: function(){
                counter++;
                var dir = {x: tbl.x-fbl.x, y: tbl.y-fbl.y, z: tbl.z-fbl.z}
                var tmp = camera.create( fbl.x+(dir.x*0.1*counter), fbl.y+(dir.y*0.1*counter), fbl.z+(dir.z*0.1*counter), 'bullet');
                _this.time.addEvent({
                    delay:75,
                    callback: function(){
                        bulletFinish(tmp);
                     }
                 })
            },
            repeat: 10
        });
    }

    // bullet trailing animation
    function bulletFinish(bullet){
        bullet.gameObject.setTexture('bullet2')
        _this.time.addEvent({
            delay: 10,
            callback: function(){
                bullet.gameObject.setTexture('bullet3')
            }
        });
    }

    xAxis = new Phaser.Math.Vector3(1, 0, 0);
    yAxis = new Phaser.Math.Vector3(0, 1, 0);
    zAxis = new Phaser.Math.Vector3(0, 0, 1);

    text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
}

function update ()
{
    camera.transformChildren(transform1, tomatoSphere);
    camera.transformChildren(transform2, innerSphere);
    camera.transformChildren(transform3, towerGun);

    updateCamControls();
}

function updateCamControls ()
{
    if (cursors.left.isDown)
    {
        if (isPosition)
        {
            camera.x += 4;
        }
        else
        {
            camera.rotate(0.01, xAxis);
        }
    }
    else if (cursors.right.isDown)
    {
        if (isPosition)
        {
            camera.x -= 4;
        }
        else
        {
            camera.rotate(-0.01, xAxis);
        }
    }

    if (cursors.up.isDown)
    {
        if (cursors.shift.isDown)
        {
            if (isPosition)
            {
                camera.y -= 4;
            }
            else
            {
                camera.rotate(0.01, zAxis);
            }
        }
        else
        {
            if (isPosition)
            {
                camera.z -= 2;
            }
            else
            {
                camera.rotate(0.01, yAxis);
            }
        }
    }
    else if (cursors.down.isDown)
    {
        if (cursors.shift.isDown)
        {
            if (isPosition)
            {
                camera.y += 4;
            }
            else
            {
                camera.rotate(-0.01, zAxis);
            }
        }
        else
        {
            if (isPosition)
            {
                camera.z += 2;
            }
            else
            {
                camera.rotate(-0.01, yAxis);
            }
        }
    }

    text.setText([
        'camera.x: ' + camera.x,
        'camera.y: ' + camera.y,
        'camera.z: ' + camera.z
    ]);
}
