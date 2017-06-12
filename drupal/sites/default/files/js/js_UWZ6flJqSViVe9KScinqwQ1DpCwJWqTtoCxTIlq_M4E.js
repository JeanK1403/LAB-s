/**
 * @file
 * Sticky table headers.
 */

(function ($, Drupal, displace) {

  'use strict';

  /**
   * Attaches sticky table headers.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the sticky table header behavior.
   */
  Drupal.behaviors.tableHeader = {
    attach: function (context) {
      $(window).one('scroll.TableHeaderInit', {context: context}, tableHeaderInitHandler);
    }
  };

  function scrollValue(position) {
    return document.documentElement[position] || document.body[position];
  }

  // Select and initialize sticky table headers.
  function tableHeaderInitHandler(e) {
    var $tables = $(e.data.context).find('table.sticky-enabled').once('tableheader');
    var il = $tables.length;
    for (var i = 0; i < il; i++) {
      TableHeader.tables.push(new TableHeader($tables[i]));
    }
    forTables('onScroll');
  }

  // Helper method to loop through tables and execute a method.
  function forTables(method, arg) {
    var tables = TableHeader.tables;
    var il = tables.length;
    for (var i = 0; i < il; i++) {
      tables[i][method](arg);
    }
  }

  function tableHeaderResizeHandler(e) {
    forTables('recalculateSticky');
  }

  function tableHeaderOnScrollHandler(e) {
    forTables('onScroll');
  }

  function tableHeaderOffsetChangeHandler(e, offsets) {
    forTables('stickyPosition', offsets.top);
  }

  // Bind event that need to change all tables.
  $(window).on({

    /**
     * When resizing table width can change, recalculate everything.
     *
     * @ignore
     */
    'resize.TableHeader': tableHeaderResizeHandler,

    /**
     * Bind only one event to take care of calling all scroll callbacks.
     *
     * @ignore
     */
    'scroll.TableHeader': tableHeaderOnScrollHandler
  });
  // Bind to custom Drupal events.
  $(document).on({

    /**
     * Recalculate columns width when window is resized and when show/hide
     * weight is triggered.
     *
     * @ignore
     */
    'columnschange.TableHeader': tableHeaderResizeHandler,

    /**
     * Recalculate TableHeader.topOffset when viewport is resized.
     *
     * @ignore
     */
    'drupalViewportOffsetChange.TableHeader': tableHeaderOffsetChangeHandler
  });

  /**
   * Constructor for the tableHeader object. Provides sticky table headers.
   *
   * TableHeader will make the current table header stick to the top of the page
   * if the table is very long.
   *
   * @constructor Drupal.TableHeader
   *
   * @param {HTMLElement} table
   *   DOM object for the table to add a sticky header to.
   *
   * @listens event:columnschange
   */
  function TableHeader(table) {
    var $table = $(table);

    /**
     * @name Drupal.TableHeader#$originalTable
     *
     * @type {HTMLElement}
     */
    this.$originalTable = $table;

    /**
     * @type {jQuery}
     */
    this.$originalHeader = $table.children('thead');

    /**
     * @type {jQuery}
     */
    this.$originalHeaderCells = this.$originalHeader.find('> tr > th');

    /**
     * @type {null|bool}
     */
    this.displayWeight = null;
    this.$originalTable.addClass('sticky-table');
    this.tableHeight = $table[0].clientHeight;
    this.tableOffset = this.$originalTable.offset();

    // React to columns change to avoid making checks in the scroll callback.
    this.$originalTable.on('columnschange', {tableHeader: this}, function (e, display) {
      var tableHeader = e.data.tableHeader;
      if (tableHeader.displayWeight === null || tableHeader.displayWeight !== display) {
        tableHeader.recalculateSticky();
      }
      tableHeader.displayWeight = display;
    });

    // Create and display sticky header.
    this.createSticky();
  }

  /**
   * Store the state of TableHeader.
   */
  $.extend(TableHeader, /** @lends Drupal.TableHeader */{

    /**
     * This will store the state of all processed tables.
     *
     * @type {Array.<Drupal.TableHeader>}
     */
    tables: []
  });

  /**
   * Extend TableHeader prototype.
   */
  $.extend(TableHeader.prototype, /** @lends Drupal.TableHeader# */{

    /**
     * Minimum height in pixels for the table to have a sticky header.
     *
     * @type {number}
     */
    minHeight: 100,

    /**
     * Absolute position of the table on the page.
     *
     * @type {?Drupal~displaceOffset}
     */
    tableOffset: null,

    /**
     * Absolute position of the table on the page.
     *
     * @type {?number}
     */
    tableHeight: null,

    /**
     * Boolean storing the sticky header visibility state.
     *
     * @type {bool}
     */
    stickyVisible: false,

    /**
     * Create the duplicate header.
     */
    createSticky: function () {
      // Clone the table header so it inherits original jQuery properties.
      var $stickyHeader = this.$originalHeader.clone(true);
      // Hide the table to avoid a flash of the header clone upon page load.
      this.$stickyTable = $('<table class="sticky-header"/>')
        .css({
          visibility: 'hidden',
          position: 'fixed',
          top: '0px'
        })
        .append($stickyHeader)
        .insertBefore(this.$originalTable);

      this.$stickyHeaderCells = $stickyHeader.find('> tr > th');

      // Initialize all computations.
      this.recalculateSticky();
    },

    /**
     * Set absolute position of sticky.
     *
     * @param {number} offsetTop
     *   The top offset for the sticky header.
     * @param {number} offsetLeft
     *   The left offset for the sticky header.
     *
     * @return {jQuery}
     *   The sticky table as a jQuery collection.
     */
    stickyPosition: function (offsetTop, offsetLeft) {
      var css = {};
      if (typeof offsetTop === 'number') {
        css.top = offsetTop + 'px';
      }
      if (typeof offsetLeft === 'number') {
        css.left = (this.tableOffset.left - offsetLeft) + 'px';
      }
      return this.$stickyTable.css(css);
    },

    /**
     * Returns true if sticky is currently visible.
     *
     * @return {bool}
     *   The visibility status.
     */
    checkStickyVisible: function () {
      var scrollTop = scrollValue('scrollTop');
      var tableTop = this.tableOffset.top - displace.offsets.top;
      var tableBottom = tableTop + this.tableHeight;
      var visible = false;

      if (tableTop < scrollTop && scrollTop < (tableBottom - this.minHeight)) {
        visible = true;
      }

      this.stickyVisible = visible;
      return visible;
    },

    /**
     * Check if sticky header should be displayed.
     *
     * This function is throttled to once every 250ms to avoid unnecessary
     * calls.
     *
     * @param {jQuery.Event} e
     *   The scroll event.
     */
    onScroll: function (e) {
      this.checkStickyVisible();
      // Track horizontal positioning relative to the viewport.
      this.stickyPosition(null, scrollValue('scrollLeft'));
      this.$stickyTable.css('visibility', this.stickyVisible ? 'visible' : 'hidden');
    },

    /**
     * Event handler: recalculates position of the sticky table header.
     *
     * @param {jQuery.Event} event
     *   Event being triggered.
     */
    recalculateSticky: function (event) {
      // Update table size.
      this.tableHeight = this.$originalTable[0].clientHeight;

      // Update offset top.
      displace.offsets.top = displace.calculateOffset('top');
      this.tableOffset = this.$originalTable.offset();
      this.stickyPosition(displace.offsets.top, scrollValue('scrollLeft'));

      // Update columns width.
      var $that = null;
      var $stickyCell = null;
      var display = null;
      // Resize header and its cell widths.
      // Only apply width to visible table cells. This prevents the header from
      // displaying incorrectly when the sticky header is no longer visible.
      var il = this.$originalHeaderCells.length;
      for (var i = 0; i < il; i++) {
        $that = $(this.$originalHeaderCells[i]);
        $stickyCell = this.$stickyHeaderCells.eq($that.index());
        display = $that.css('display');
        if (display !== 'none') {
          $stickyCell.css({width: $that.css('width'), display: display});
        }
        else {
          $stickyCell.css('display', 'none');
        }
      }
      this.$stickyTable.css('width', this.$originalTable.outerWidth());
    }
  });

  // Expose constructor in the public space.
  Drupal.TableHeader = TableHeader;

}(jQuery, Drupal, window.parent.Drupal.displace));
;
/**
 * @file
 * Table select functionality.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Initialize tableSelects.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches tableSelect functionality.
   */
  Drupal.behaviors.tableSelect = {
    attach: function (context, settings) {
      // Select the inner-most table in case of nested tables.
      $(context).find('th.select-all').closest('table').once('table-select').each(Drupal.tableSelect);
    }
  };

  /**
   * Callback used in {@link Drupal.behaviors.tableSelect}.
   */
  Drupal.tableSelect = function () {
    // Do not add a "Select all" checkbox if there are no rows with checkboxes
    // in the table.
    if ($(this).find('td input[type="checkbox"]').length === 0) {
      return;
    }

    // Keep track of the table, which checkbox is checked and alias the
    // settings.
    var table = this;
    var checkboxes;
    var lastChecked;
    var $table = $(table);
    var strings = {
      selectAll: Drupal.t('Select all rows in this table'),
      selectNone: Drupal.t('Deselect all rows in this table')
    };
    var updateSelectAll = function (state) {
      // Update table's select-all checkbox (and sticky header's if available).
      $table.prev('table.sticky-header').addBack().find('th.select-all input[type="checkbox"]').each(function () {
        var $checkbox = $(this);
        var stateChanged = $checkbox.prop('checked') !== state;

        $checkbox.attr('title', state ? strings.selectNone : strings.selectAll);

        /**
         * @checkbox {HTMLElement}
         */
        if (stateChanged) {
          $checkbox.prop('checked', state).trigger('change');
        }
      });
    };

    // Find all <th> with class select-all, and insert the check all checkbox.
    $table.find('th.select-all').prepend($('<input type="checkbox" class="form-checkbox" />').attr('title', strings.selectAll)).on('click', function (event) {
      if ($(event.target).is('input[type="checkbox"]')) {
        // Loop through all checkboxes and set their state to the select all
        // checkbox' state.
        checkboxes.each(function () {
          var $checkbox = $(this);
          var stateChanged = $checkbox.prop('checked') !== event.target.checked;

          /**
           * @checkbox {HTMLElement}
           */
          if (stateChanged) {
            $checkbox.prop('checked', event.target.checked).trigger('change');
          }
          // Either add or remove the selected class based on the state of the
          // check all checkbox.

          /**
           * @checkbox {HTMLElement}
           */
          $checkbox.closest('tr').toggleClass('selected', this.checked);
        });
        // Update the title and the state of the check all box.
        updateSelectAll(event.target.checked);
      }
    });

    // For each of the checkboxes within the table that are not disabled.
    checkboxes = $table.find('td input[type="checkbox"]:enabled').on('click', function (e) {
      // Either add or remove the selected class based on the state of the
      // check all checkbox.

      /**
       * @this {HTMLElement}
       */
      $(this).closest('tr').toggleClass('selected', this.checked);

      // If this is a shift click, we need to highlight everything in the
      // range. Also make sure that we are actually checking checkboxes
      // over a range and that a checkbox has been checked or unchecked before.
      if (e.shiftKey && lastChecked && lastChecked !== e.target) {
        // We use the checkbox's parent <tr> to do our range searching.
        Drupal.tableSelectRange($(e.target).closest('tr')[0], $(lastChecked).closest('tr')[0], e.target.checked);
      }

      // If all checkboxes are checked, make sure the select-all one is checked
      // too, otherwise keep unchecked.
      updateSelectAll((checkboxes.length === checkboxes.filter(':checked').length));

      // Keep track of the last checked checkbox.
      lastChecked = e.target;
    });

    // If all checkboxes are checked on page load, make sure the select-all one
    // is checked too, otherwise keep unchecked.
    updateSelectAll((checkboxes.length === checkboxes.filter(':checked').length));
  };

  /**
   * @param {HTMLElement} from
   *   The HTML element representing the "from" part of the range.
   * @param {HTMLElement} to
   *   The HTML element representing the "to" part of the range.
   * @param {bool} state
   *   The state to set on the range.
   */
  Drupal.tableSelectRange = function (from, to, state) {
    // We determine the looping mode based on the order of from and to.
    var mode = from.rowIndex > to.rowIndex ? 'previousSibling' : 'nextSibling';

    // Traverse through the sibling nodes.
    for (var i = from[mode]; i; i = i[mode]) {
      var $i;
      // Make sure that we're only dealing with elements.
      if (i.nodeType !== 1) {
        continue;
      }
      $i = $(i);
      // Either add or remove the selected class based on the state of the
      // target checkbox.
      $i.toggleClass('selected', state);
      $i.find('input[type="checkbox"]').prop('checked', state);

      if (to.nodeType) {
        // If we are at the end of the range, stop.
        if (i === to) {
          break;
        }
      }
      // A faster alternative to doing $(i).filter(to).length.
      else if ($.filter(to, [i]).r.length) {
        break;
      }
    }
  };

})(jQuery, Drupal);
;
