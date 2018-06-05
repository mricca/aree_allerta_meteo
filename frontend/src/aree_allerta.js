var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

$('#startDate').datepicker({
    uiLibrary: 'bootstrap4',
    iconsLibrary: 'fontawesome',
    value: moment().startOf('year').format('YYYY-MM-DD'),
    format: 'yyyy-mm-dd',
    maxDate: function() {
        return $('#endDate').val();
    }
});

$('#endDate').datepicker({
    uiLibrary: 'bootstrap4',
    iconsLibrary: 'fontawesome',
    value: moment().format('YYYY-MM-DD'),
    format: 'yyyy-mm-dd'
});

var $table = $('#table'),
    $remove = $('#remove'),
    selections = [];

function initTable() {
    $table.bootstrapTable({
        height: 550,
        columns: [
            [{
                field: 'codallerta',
                title: 'Codice Allerta',
                sortable: true,
                editable: false,
                align: 'center'
            }, {
                field: 'ssigla',
                title: 'Sigla',
                sortable: true,
                editable: false,
                align: 'center'
            }, {
                field: 'sdescr',
                title: 'Descrizione',
                sortable: true,
                editable: false,
                align: 'center'
            }, {
                field: 'data',
                title: 'Data',
                sortable: true,
                editable: false,
                align: 'center'
            }, {
                field: 'impatto_24.desc',
                title: 'Impatto 24',
                sortable: true,
                editable: false,
                formatter: impattoFormatter,
                align: 'center'
            }, {
                field: 'impatto_48.desc',
                title: 'Impatto 48',
                sortable: true,
                editable: false,
                formatter: impattoFormatter,
                align: 'center'
            }]
        ]
    });

    // sometimes footer render error.
    setTimeout(function() {
        $table.bootstrapTable('resetView');
    }, 200);

    $table.on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table', function() {
        $remove.prop('disabled', !$table.bootstrapTable('getSelections').length);
        // save your data, here just save the current page
        selections = getIdSelections();
        // push or splice the selections if you want to save all data selections
    });

    //$table.on('expand-row.bs.table', function (e, index, row, $detail) {
    //    if (index % 2 == 1) {
    //        $detail.html('Loading from ajax request...');
    //        $.get('LICENSE', function (res) {
    //            $detail.html(res.replace(/\n/g, '<br>'));
    //        });
    //    }
    //});
    // $table.on('all.bs.table', function (e, name, args) {
    //     console.log(name, args);
    // });
    // $remove.click(function () {
    //     var ids = getIdSelections();
    //     $table.bootstrapTable('remove', {
    //         field: 'id',
    //         values: ids
    //     });
    //     $remove.prop('disabled', true);
    // });
    // $(window).resize(function () {
    //     $table.bootstrapTable('resetView', {
    //         height: getHeight()
    //     });
    // });
    //$('#myFilter').on( 'click', function () {
    //    $table.bootstrapTable('refresh');
    //} );

    $('#codiceAllerta').on('change', function() {
        $table.bootstrapTable('refresh');
    });

    $('#areaAllerta').on('change', function() {
        $table.bootstrapTable('refresh');
    });

    $('#impatto').on('change', function() {
        $table.bootstrapTable('refresh');
    });

    $('#startDate').on('change', function() {
        $table.bootstrapTable('refresh');
    });

    $('#endDate').on('change', function() {
        $table.bootstrapTable('refresh');
    });

    $('#radio24').on('change', function() {
        $table.bootstrapTable('refresh');
    });

    $('#radio48').on('change', function() {
        $table.bootstrapTable('refresh');
    });
}

function getIdSelections() {
    return $.map($table.bootstrapTable('getSelections'), function(row) {
        return row.id
    });
}

function responseHandler(res) {
    var conteggio_impatto24_nessuno = $('#verde');
    var conteggio_impatto24_basso = $('#gialla');
    var conteggio_impatto24_medio = $('#arancio');
    var conteggio_impatto24_alto = $('#rossa');
    var conteggio_impatto24_totale = $('#totale');

    var rangeYears = $('#bollettino-title-giorno');
    rangeYears.text('dal ' + $('#startDate').val() + " al " + $('#endDate').val())

    conteggio_impatto24_nessuno.html('<strong>' + res.conteggio_impatto24.nessuno + '</strong>');
    conteggio_impatto24_basso.html('<strong>' + res.conteggio_impatto24.basso + '</strong>');
    conteggio_impatto24_medio.html('<strong>' + res.conteggio_impatto24.medio + '</strong>');
    conteggio_impatto24_alto.html('<strong>' + res.conteggio_impatto24.alto + '</strong>');
    conteggio_impatto24_totale.text(res.conteggio_impatto24.totale);
    return res;
}

function queryParams(d) {
    var from = $('#startDate').val();
    var to = $('#endDate').val();
    var ssigla = $('#areaAllerta').val();
    var impatto = !$('#impatto').selectpicker('val') ? 0 : $('#impatto').selectpicker('val').join();
    var codallerta = !$('#codiceAllerta').selectpicker('val') ? 0 : $('#codiceAllerta').selectpicker('val').join();
    var tipoImpatto;

    $.each($("input[name='inlineRadioOptions']:checked"), function() {
        tipoImpatto = $(this).val();
    });

    d.tipoimpatto = tipoImpatto;
    d.ssigla = ssigla;
    d.fromData = from;
    d.toData = to;
    d.impatto = impatto.lenght || impatto ? impatto : 0;
    d.codallerta = codallerta.lenght || codallerta ? codallerta : 0;

    return d;
}

function optionsAjax() {
    var p = {
        xhrFields: {
            withCredentials: false
        },
        crossDomain: true,
        method: 'GET'
    }
    return p;
}
// function detailFormatter(index, row) {
//     var html = [];
//     $.each(row, function (key, value) {
//         html.push('<p><b>' + key + ':</b> ' + value + '</p>');
//     });
//     return html.join('');
// }
//
// function operateFormatter(value, row, index) {
//     return [
//         '<a class="like" href="javascript:void(0)" title="Like">',
//         '<i class="glyphicon glyphicon-heart"></i>',
//         '</a>  ',
//         '<a class="remove" href="javascript:void(0)" title="Remove">',
//         '<i class="glyphicon glyphicon-remove"></i>',
//         '</a>'
//     ].join('');
// }
//
// window.operateEvents = {
//     'click .like': function (e, value, row, index) {
//         alert('You click like action, row: ' + JSON.stringify(row));
//     },
//     'click .remove': function (e, value, row, index) {
//         $table.bootstrapTable('remove', {
//             field: 'id',
//             values: [row.id]
//         });
//     }
// };
//
// function totalTextFormatter(data) {
//     return 'Total';
// }

function impattoFormatter(data) {
    var impatto;
    switch (data) {
        case 'nessuno':
            impatto = '<div style="background-color: #99CC00; font-weight: bold; outline: 4px solid #99CC00;">VERDE</div>';
            break;
        case 'basso':
            impatto = '<div style="background-color: #FFFF00; font-weight: bold; outline: 4px solid #FFFF00;">GIALLO</div>';
            break;
        case 'medio':
            impatto = '<div style="background-color: #FFA500; font-weight: bold; outline: 4px solid #FFA500;">ARANCIO</div>';
            break;
        case 'alto':
            impatto = '<div style="background-color: #FF0000; font-weight: bold; outline: 4px solid #FF0000;">ROSSO</div>';
            break;
        default:
            impatto = '<div style="background-color: #99CC00; font-weight: bold; outline: 4px solid #99CC00;">VERDE</div>';
    }
    return impatto;
}

function getHeight() {
    return $(window).height() - $('h1').outerHeight(true);
}

$(function() {
    var scripts = [
            location.search.substring(1) || 'assets/bootstrap-table/dist/bootstrap-table.js',
            'assets/bootstrap-table/dist/extensions/export/bootstrap-table-export.js',
            'http://rawgit.com/hhurz/tableExport.jquery.plugin/master/tableExport.js',
            'assets/bootstrap-table/dist/extensions/editable/bootstrap-table-editable.js',
            'http://rawgit.com/vitalets/x-editable/master/dist/bootstrap3-editable/js/bootstrap-editable.js'
        ],
        eachSeries = function(arr, iterator, callback) {
            callback = callback || function() {};
            if (!arr.length) {
                return callback();
            }
            var completed = 0;
            var iterate = function() {
                iterator(arr[completed], function(err) {
                    if (err) {
                        callback(err);
                        callback = function() {};
                    } else {
                        completed += 1;
                        if (completed >= arr.length) {
                            callback(null);
                        } else {
                            iterate();
                        }
                    }
                });
            };
            iterate();
        };

    eachSeries(scripts, getScript, initTable);
});

function getScript(url, callback) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.src = url;

    var done = false;
    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function() {
        if (!done && (!this.readyState ||
                this.readyState == 'loaded' || this.readyState == 'complete')) {
            done = true;
            if (callback)
                callback();

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
        }
    };

    head.appendChild(script);

    // We handle everything using the script element injection
    return undefined;
}
