janus.registerElement('avatar_simple', {
  headsrc: 'media/assets/hoverscreen.obj',
  bodysrc: '',
  handsrc: '',
  create() {
    if (this.headsrc) {
      this.head = this.createObject('object', {id: this.headsrc});
    }
    if (this.bodysrc) {
      this.body = this.createObject('object', {id: this.bodysrc});
    }
    if (this.handsrc) {
      this.hands = this.createObject('object', {id: this.handsrc});
    }
    //this.attachToPlayer();
  },
  attachToPlayer(player) {
    // THIS IS WHERE I STOPPED
    // I need to attach this avatar object to the player so it can do whatever it needs to position its sub-objects
    // In this case this is the simple head-and-hands avatar style, but it should be done in a way that can work
    // with more advanced types, like rigged models with IK
    player.addEventListener('xrframe', (ev) => this.handleXRFrame(ev));
  },
  //update(dt) {
  //},
  handleXRFrame(ev) {
    console.log('update it', ev.target, ev.data);
  }
});
janus.registerElement('avatar_rigged', {
  create() {
  },
  update(dt) {
  },
  updateXR(pose, referenceSpace) {
  }
});

elation.elements.define('janus-avatar-picker', class extends elation.elements.base {
  init() {
    this.defineAttribute('src', { type: 'string' });
    this.selected = false;
  }
  create() {
    this.elements = elation.elements.fromString(`
      <collection-jsonapi id="avatarlist" endpoint="${this.src}"></collection-jsonapi>
      <ui-list name="avatar" selectable="1" collection="avatarlist" itemcomponent="janus-avatar-picker-item"></ui-list>
      <ui-button name="confirm" disabled="1">Confirm</ui-button>
      <ui-button name="reset">Reset</ui-button>
    `, this);
    elation.events.add(this.elements['avatar'], 'select', (ev) => this.handleAvatarSelect(ev));
    elation.events.add(this.elements['confirm'], 'click', (ev) => this.handleAvatarConfirm(ev));
    elation.events.add(this.elements['reset'], 'click', (ev) => this.handleAvatarReset(ev));
  }
  handleAvatarSelect(ev) {
    console.log('selected an avatar', ev.data);
    if (this.avatarpreview) {
      this.avatarpreview.die();
    }
    this.selected = ev.data;
    this.avatarpreview = player.createObject('ghost', { avatar_src: ev.data.url, pos: V(-2, 0, -3) });
    this.elements.confirm.disabled = false;
  }
  handleAvatarConfirm(ev) {
    if (this.avatarpreview) {
      this.avatarpreview.die();
    }
    if (this.selected) {
      fetch(this.selected.url)
        .then(r => r.text())
        .then(t => {
          player.setAvatar(t);
          this.dispatchEvent(new CustomEvent('select', { detail: this.selected }));
        });
    }
  }
  handleAvatarReset(ev) {
    player.setAvatar(player.defaultAvatar);
  }
});
elation.elements.define('janus-avatar-picker-item', class extends elation.elements.ui.item {
  create() {
    elation.events.add(this, 'click', (ev) => { console.log('duh', this); this.click(ev) });
    let item = this.value;
    this.elements = elation.elements.fromString(`
      <img src="${item.thumb}">
    `, this);
  }
});
