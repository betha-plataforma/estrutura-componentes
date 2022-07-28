import {Component, h, Prop} from '@stencil/core';
import {isNill} from '../../../utils/functions';

@Component({
  tag: 'bth-icone-badge',
  styleUrl: 'icone-badge.css',
  shadow: true
})
export class IconeBadge {

  /**
   * Title que deverá aparecer na badge
   */
  @Prop({ reflect: true }) readonly badgeTitle?: string;

  render() {
    return (
      <div class="icon-badge-container">
        <slot name="icone" />
        <div class="icon-badge" title={`${isNill(this.badgeTitle) ? '' :this.badgeTitle}`}></div>
      </div>
    );
  }
}
