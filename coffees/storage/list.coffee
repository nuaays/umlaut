# This file is part of umlaut

# Copyright (C) 2013 Kozea - Mounier Florian <paradoxxx.zero->gmail.com>

# umlaut is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or any later version.

# umlaut is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see http://www.gnu.org/licenses/.


list_diagrams = ->
    $tbody = $('.table.local tbody')
    $tbody.find('tr').remove()
    $('.local').show()
    for key, b64_diagram of localStorage
        [type, title] = key.split('|')
        if not title?
            continue
        $tbody.append($tr = $('<tr>'))
        $tr.append(
            $('<td>').text(title),
            $('<td>').text((new (Diagrams._get(type))()).label),
            $('<td>')
                .append($('<a>').attr('href', "##{b64_diagram}").append($('<i>', class: 'glyphicon glyphicon-folder-open')))
                # .append($('<a>').attr('href', "#").append($('<i>', class: 'glyphicon glyphicon-cloud-upload')).on('click', ((k, b64) -> ->
                #     publish(k, b64)
                #     false)(key, b64_diagram)))
                .append($('<a>').attr('href', "#").append($('<i>', class: 'glyphicon glyphicon-trash')).on('click', ((k) -> ->
                    localStorage.removeItem k
                    $(@).closest('tr').remove()
                    false)(key))))
    if not $tbody.find('tr').size()
        $('.local').hide()

    $tbody = $('.table.new tbody')
    $tbody.find('tr').remove()
    for name, type of Diagrams
        if name.match(/^_/)
            continue
        diagram = new type()
        b64_diagram = diagram.hash()
        $tbody.append($tr = $('<tr>'))
        $tr.append(
            $('<td>').text(diagram.label),
            $('<td>').append($('<a>').attr('href', "##{b64_diagram}").append($('<i>', class: 'glyphicon glyphicon-file'))))


    $tbody = $('.table.server tbody')
    # $tbody.find('tr').remove()

    # remoteStorage.getItem('umlaut_key_list', (list) ->
    #     list = JSON.parse(list)
    #     for key in list
    #         remoteStorage.getItem(key, (b64_diagram, key_) ->
    #             [type, title] = key_.slice(7).split('-_-')
    #             if not title?
    #                 return
    #             $tbody.append($tr = $('<tr>'))
    #             $tr.append(
    #                 $('<td>').text(title),
    #                 $('<td>').text((new (Diagrams._get(type))()).label),
    #                 $('<td>')
    #                     .append($('<a>').attr('href', "##{b64_diagram}").append($('<i>', class: 'glyphicon glyphicon-cloud-download'))))))
