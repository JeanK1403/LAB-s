<?php
/**
 * @file
 * Contains \Drupal\bootstrap\Plugin\Alter\ThemeRegistry.
 */

// Name of the base theme must be lowercase for it to be autoload discoverable.
namespace Drupal\bootstrap\Plugin\Alter;

use Drupal\bootstrap\Annotation\BootstrapAlter;
use Drupal\bootstrap\Bootstrap;
use Drupal\bootstrap\Plugin\PreprocessManager;
use Drupal\Core\Theme\Registry;

/**
 * Extends the theme registry to override and use protected functions.
 *
 * @todo Refactor into a proper theme.registry service replacement in a
 * bootstrap_core sub-module once this theme can add it as a dependency.
 *
 * @see https://www.drupal.org/node/474684
 *
 * @ingroup plugins_alter
 *
 * @BootstrapAlter("theme_registry")
 */
class ThemeRegistry extends Registry implements AlterInterface {

  /**
   * The currently set Bootstrap theme object.
   *
   * Cannot use "$theme" because this is the Registry's ActiveTheme object.
   *
   * @var \Drupal\bootstrap\Theme
   */
  protected $currentTheme;

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    // This is technically a plugin constructor, but because we wish to use the
    // protected methods of the Registry class, we must extend from it. Thus,
    // to properly construct the extended Registry object, we must pass the
    // arguments it would normally get from the service container to "fake" it.
    if (!isset($configuration['theme'])) {
      $configuration['theme'] = Bootstrap::getTheme();
    }
    $this->currentTheme = $configuration['theme'];
    parent::__construct(
      \Drupal::service('app.root'),
      \Drupal::service('cache.default'),
      \Drupal::service('lock'),
      \Drupal::service('module_handler'),
      \Drupal::service('theme_handler'),
      \Drupal::service('theme.initialization'),
      $this->currentTheme->getName()
    );
    $this->setThemeManager(\Drupal::service('theme.manager'));
    $this->init();
  }

  /**
   * {@inheritdoc}
   */
  public function alter(&$cache, &$context1 = NULL, &$context2 = NULL) {
    // Sort the registry alphabetically (for easier debugging).
    ksort($cache);

    // Add extra variables to all theme hooks.
    $extra_variables = Bootstrap::extraVariables();
    foreach (array_keys($cache) as $hook) {
      // Skip theme hooks that don't set variables.
      if (!isset($cache[$hook]['variables'])) {
        continue;
      }
      $cache[$hook]['variables'] += $extra_variables;
    }

    // Ensure paths to templates are set properly. This allows templates to
    // be moved around in a theme without having to constantly ensuring that
    // the theme's hook_theme() definitions have the correct static "path" set.
    foreach ($this->currentTheme->getAncestry() as $ancestor) {
      $current_theme = $ancestor->getName() === $this->currentTheme->getName();
      $theme_path = $ancestor->getPath();
      foreach ($ancestor->fileScan('/\.html\.twig$/', 'templates') as $file) {
        $hook = str_replace('-', '_', str_replace('.html.twig', '', $file->filename));
        $path = dirname($file->uri);
        $incomplete = !isset($cache[$hook]) || strrpos($hook, '__');
        if (!isset($cache[$hook])) {
          $cache[$hook] = [];
        }
        $cache[$hook]['path'] = $path;
        $cache[$hook]['type'] = $current_theme ? 'theme' : 'base_theme';
        $cache[$hook]['theme path'] = $theme_path;
        if ($incomplete) {
          $cache[$hook]['incomplete preprocess functions'] = TRUE;
        }
      }
    }

    // Discover all the theme's preprocess plugins.
    $preprocess_manager = new PreprocessManager($this->currentTheme);
    $plugins = $preprocess_manager->getDefinitions();
    ksort($plugins, SORT_NATURAL);

    // Iterate over the preprocess plugins.
    foreach ($plugins as $plugin_id => $definition) {
      $incomplete = !isset($cache[$plugin_id]) || strrpos($plugin_id, '__');
      if (!isset($cache[$plugin_id])) {
        $cache[$plugin_id] = [];
      }
      array_walk($cache, function (&$info, $hook) use ($plugin_id, $definition) {
        if ($hook === $plugin_id || strpos($hook, $plugin_id . '__') === 0) {
          if (!isset($info['preprocess functions'])) {
            $info['preprocess functions'] = [];
          }
          // Due to a limitation in \Drupal\Core\Theme\ThemeManager::render,
          // callbacks must be functions and not classes. We always specify
          // "bootstrap_preprocess" here and then assign the plugin ID to a
          // separate property that we can later intercept and properly invoke.
          // @todo Revisit if/when preprocess callbacks can be any callable.
          Bootstrap::addCallback($info['preprocess functions'], 'bootstrap_preprocess', $definition['replace'], $definition['action']);
          $info['preprocess functions'] = array_unique($info['preprocess functions']);
          $info['bootstrap preprocess'] = $plugin_id;
        }
      });

      if ($incomplete) {
        $cache[$plugin_id]['incomplete preprocess functions'] = TRUE;
      }
    }

    // Allow core to post process.
    $this->postProcessExtension($cache, $this->theme);
  }

}