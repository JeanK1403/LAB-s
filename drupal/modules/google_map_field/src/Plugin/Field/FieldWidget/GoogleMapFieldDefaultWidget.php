<?php

namespace Drupal\google_map_field\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'google_map_field_default' widget.
 *
 * @FieldWidget(
 *   id = "google_map_field_default",
 *   label = @Translation("Google Map Field default"),
 *   field_types = {
 *     "google_map_field"
 *   }
 * )
 */
class GoogleMapFieldDefaultWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    $element += array(
      '#type' => 'fieldset',
      '#title' => $this->t('Map'),
    );
    $element['#attached']['library'][] = 'google_map_field/google-map-field-widget-renderer';
    $element['#attached']['library'][] = 'google_map_field/google-map-apis';

    $element['preview'] = array(
      '#type' => 'item',
      '#title' => $this->t('Preview'),
      '#markup' => '<div class="google-map-field-preview" data-delta="' . $delta . '"></div>',
      '#prefix' => '<div class="google-map-field-widget right">',
      '#suffix' => '</div>',
    );

    $element['intro'] = array(
      '#type' => 'markup',
      '#markup' => $this->t('Use the "Set Map" button for more options.'),
      '#prefix' => '<div class="google-map-field-widget left">',
    );

    $element['name'] = array(
      '#title' => $this->t('Map Name'),
      '#size' => 32,
      '#type' => 'textfield',
      '#default_value' => isset($items[$delta]->name) ? $items[$delta]->name : NULL,
      '#attributes' => array(
        'data-name-delta' => $delta,
      ),
    );

    $element['lat'] = array(
      '#title' => $this->t('Latitude'),
      '#type' => 'textfield',
      '#size' => 18,
      '#default_value' => isset($items[$delta]->lat) ? $items[$delta]->lat : NULL,
      '#attributes' => array(
        'data-lat-delta' => $delta,
        'class' => array(
          'google-map-field-watch-change',
        ),
      ),
    );

    $element['lon'] = array(
      '#title' => $this->t('Longitude'),
      '#type' => 'textfield',
      '#size' => 18,
      '#default_value' => isset($items[$delta]->lon) ? $items[$delta]->lon : NULL,
      '#attributes' => array(
        'data-lon-delta' => $delta,
        'class' => array(
          'google-map-field-watch-change',
        ),
      ),
      '#suffix' => '</div>',
    );

    $element['zoom'] = array(
      '#type' => 'hidden',
      '#default_value' => isset($items[$delta]->zoom) ? $items[$delta]->zoom : 9,
      '#attributes' => array(
        'data-zoom-delta' => $delta,
      ),
    );

    $element['type'] = array(
      '#type' => 'hidden',
      '#default_value' => isset($items[$delta]->type) ? $items[$delta]->type : 'roadmap',
      '#attributes' => array(
        'data-type-delta' => $delta,
      ),
    );

    $element['width'] = array(
      '#type' => 'hidden',
      '#default_value' => isset($items[$delta]->width) ? $items[$delta]->width : '100%',
      '#attributes' => array(
        'data-width-delta' => $delta,
      ),
    );

    $element['height'] = array(
      '#type' => 'hidden',
      '#default_value' => isset($items[$delta]->height) ? $items[$delta]->height : '450px',
      '#attributes' => array(
        'data-height-delta' => $delta,
      ),
    );

    $element['marker'] = array(
      '#type' => 'hidden',
      '#default_value' => isset($items[$delta]->marker) ? $items[$delta]->marker : "1",
      '#attributes' => array(
        'data-marker-delta' => $delta,
      ),
    );

    $element['controls'] = array(
      '#type' => 'hidden',
      '#default_value' => isset($items[$delta]->controls) ? $items[$delta]->controls : "1",
      '#attributes' => array(
        'data-controls-delta' => $delta,
      ),
    );

    $element['actions'] = array(
      '#type' => 'actions',
      '#attributes' => array(
        'class' => array('field-map-actions'),
      ),
    );

    $element['actions']['open_map'] = array(
      '#type' => 'button',
      '#value' => $this->t('Set Map'),
      '#attributes' => array(
        'data-delta' => $delta,
        'id' => 'map_setter_' . $delta,
      ),
    );

    $element['actions']['clear_fields'] = array(
      '#type' => 'button',
      '#value' => $this->t('Clear'),
      '#attributes' => array(
        'data-delta' => $delta,
        'id' => 'clear_fields_' . $delta,
        'class' => array(
          'google-map-field-clear',
        ),
      ),
    );

    return $element;
  }

}
