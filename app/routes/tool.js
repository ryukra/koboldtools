import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
  model() {
    return RSVP.hash({
      npcs: this.store.findAll('np'),
      scenes: this.store.findAll('scene'),
      threads: this.store.findAll('thread'),
      pcs: this.store.findAll('pc')
    });
    
  },
  setupController(controller, models) {
    controller.set('npcs', models.npcs);
    controller.set('scenes', models.scenes);
    controller.set('threads', models.threads);
    controller.set('pcs', models.pcs);
  }
});
