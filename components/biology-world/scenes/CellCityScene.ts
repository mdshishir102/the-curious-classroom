import Phaser from "phaser";

type SceneCallbacks = {
  onFact: (text: string) => void;
};

const ORGANELLES = [
  { name: "নিউক্লিয়াস", x: 300, y: 250, color: 0x7c3aed, fact: "নিউক্লিয়াসকে কোষের 'কন্ট্রোল রুম' বলা হয় — এখানে DNA থাকে!" },
  { name: "মাইটোকন্ড্রিয়া", x: 850, y: 400, color: 0xef4444, fact: "মাইটোকন্ড্রিয়া হলো কোষের পাওয়ার হাউজ, এখানে ATP তৈরি হয়!" },
  { name: "রাইবোজোম", x: 450, y: 600, color: 0x3b82f6, fact: "রাইবোজোম হলো প্রোটিন তৈরির কারখানা!" },
  { name: "গলগি বডি", x: 750, y: 150, color: 0xf59e0b, fact: "গলগি বডি কোষের 'পোস্ট অফিস' — প্যাকেজিং ও পাঠানোর কাজ করে!" },
];

export class CellCityScene extends Phaser.Scene {
  private cb: SceneCallbacks;
  private avatarUrl: string;
  private player!: Phaser.GameObjects.Container;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private speed = 220;
  private touchVector = { x: 0, y: 0 };
  private touchStart: { x: number; y: number } | null = null;

  constructor(cb: SceneCallbacks, avatarUrl: string) {
    super("CellCityScene");
    this.cb = cb;
    this.avatarUrl = avatarUrl;
  }

  preload() {
    this.load.image("face", this.avatarUrl);
  }

  create() {
    const worldW = 1200;
    const worldH = 800;
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    // ব্যাকগ্রাউন্ড (কোষের মেমব্রেন ফিল)
    const bg = this.add.graphics();
    bg.fillStyle(0x0b1f14, 1);
    bg.fillRect(0, 0, worldW, worldH);
    bg.lineStyle(6, 0x10b981, 0.4);
    bg.strokeRoundedRect(20, 20, worldW - 40, worldH - 40, 60);

    // অর্গানেল "বিল্ডিং" + ইন্টারঅ্যাকশন জোন
    const organelleGroup = this.physics.add.staticGroup();
    ORGANELLES.forEach((o) => {
      this.add.circle(o.x, o.y, 55, o.color, 0.85).setStrokeStyle(3, 0xffffff, 0.5);
      this.add.text(o.x, o.y + 75, o.name, {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      }).setOrigin(0.5);

      const zone = this.add.zone(o.x, o.y, 130, 130);
      this.physics.add.existing(zone, true);
      organelleGroup.add(zone as any);
      (zone as any).factText = o.fact;
    });

    // প্লেয়ার — Container ভিত্তিক (body shape + circular face, কোনো mask ছাড়াই)
    const bodyShape = this.add.graphics();
    bodyShape.fillStyle(0x2563eb, 1);
    bodyShape.fillRoundedRect(-28, 10, 56, 42, 16);
    bodyShape.fillStyle(0x1d4ed8, 1);
    bodyShape.fillRoundedRect(-28, 32, 56, 20, 12);

    const faceImg = this.add.image(0, -8, "face").setDisplaySize(52, 52);

    // খেলোয়াড়ের নাম ট্যাগ (ঐচ্ছিক, সুন্দর টাচ)
    const nameTag = this.add.text(0, -44, "তুমি", {
      fontSize: "12px",
      color: "#93c5fd",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.player = this.add.container(worldW / 2, worldH / 2, [bodyShape, faceImg, nameTag]);
    this.player.setDepth(10);
    this.player.setSize(56, 80);

    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(56, 80);
    body.setOffset(-28, -40);
    body.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.physics.add.overlap(this.player, organelleGroup, (_p, zoneObj: any) => {
      if (!zoneObj.lastShown) {
        this.cb.onFact(zoneObj.factText);
        zoneObj.lastShown = true;
        this.time.delayedCall(4000, () => (zoneObj.lastShown = false));
      }
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys("W,A,S,D");
    this.setupTouchControls();
  }

  private setupTouchControls() {
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.touchStart = { x: p.x, y: p.y };
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.touchStart && p.isDown) {
        const dx = p.x - this.touchStart.x;
        const dy = p.y - this.touchStart.y;
        const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        this.touchVector = { x: dx / len, y: dy / len };
      }
    });
    this.input.on("pointerup", () => {
      this.touchVector = { x: 0, y: 0 };
      this.touchStart = null;
    });
  }

  update() {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    if (vx === 0 && vy === 0 && (this.touchVector.x !== 0 || this.touchVector.y !== 0)) {
      vx = this.touchVector.x;
      vy = this.touchVector.y;
    }

    const len = Math.sqrt(vx * vx + vy * vy) || 1;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity((vx / len) * this.speed, (vy / len) * this.speed);
  }
}