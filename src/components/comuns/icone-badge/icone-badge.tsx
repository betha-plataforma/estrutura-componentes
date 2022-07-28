import {Component, h, Prop} from '@stencil/core';
import {isNill} from '../../../utils/functions';

@Component({
  tag: 'bth-icone-badge',
  styleUrl: 'icone-badge.css',
  shadow: true
})
export class IconeBadge {

  render() {
    return (
      <div class="icon-container">
        <slot name="icone"></slot>
        <span class="badge-icon" title={`${isNill(this.badgeTitle) ? '' : this.badgeTitle}`}></span>
      </div>
    );}

  /**
   * Title que deverá aparecer na badge
   */
  @Prop({ reflect: true }) readonly badgeTitle?: string;
}
