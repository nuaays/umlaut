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


pi = Math.PI

to_deg = (a) ->
  180 * a / pi

to_rad = (a) ->
  pi * a / 180

dist = (o, t) ->
  Math.sqrt(Math.pow((t.x - o.x), 2) + Math.pow((t.y - o.y), 2))

rotate = (pos, a) ->
  x: pos.x * Math.cos(a) - pos.y * Math.sin(a)
  y: pos.x * Math.sin(a) + pos.y * Math.cos(a)

mod2pi = (a) ->
  ((a % (2 * pi)) + 2 * pi) % (2 * pi)

atan2 = (y, x) ->
  mod2pi Math.atan2(y, x)

to_svg_angle = (a) ->
  to_deg mod2pi(a)

cardinal =
  N: 3 * pi / 2
  S: pi / 2
  W: pi
  E: 0

angle_to_cardinal = (a) ->
  if pi / 4 < a <= 3 * pi / 4
    return 'S'
  if 3 * pi / 4 < a <= 5 * pi / 4
    return 'W'
  if 5 * pi / 4 < a <= 7 * pi / 4
    return 'N'
  return 'E'

cardinal_to_direction = (c) ->
  switch c
    when 'N'
      x: 0
      y: -1
    when 'S'
      x: 0
      y: 1
    when 'W'
      x: -1
      y: 0
    when 'E'
      x: 1
      y: 0
    when 'SE'
      x: 1
      y: 1
    when 'SW'
      x: -1
      y: 1
    when 'NW'
      x: -1
      y: -1
    when 'NE'
      x: 1
      y: -1

timestamp = ->
  new Date().getTime() * 1000 + Math.round((Math.random() * 1000))

capitalize = (s) ->
  s.charAt(0).toUpperCase() + s.substr(1).toLowerCase()

next = (o, k) ->
  keys = Object.keys(o)
  next_key = keys[(keys.indexOf(k) + 1) % keys.length]
  if next_key.indexOf('_') is 0
    return next(o, next_key)
  next_key

merge = (o1, o2) ->
  for attr of o2
    o1[attr] = o2[attr]
  o1

o_copy = (o) ->
  c = {}
  for attr of o
    c[attr] = o[attr]
  c

merge_copy = (o1, o2) ->
  o3 = {}
  for attr of o1
    o3[attr] = o1[attr]

  for attr of o2
    o3[attr] = o2[attr]
  o3


node_style = (node) ->
  if not node.attrs
    return undefined
  styles = []

  attrs = node.attrs
  style = attrs.style?.split(',') or []
  if 'invisible' in style
    styles.push 'display: none'
  if 'dashed' in style
    styles.push 'stroke-dasharray: 10, 5'
  if 'dotted' in style
    styles.push 'stroke-dasharray: 2, 6'
  if 'bold' in style
    styles.push 'stroke-width: 2.5'
  if 'filled' in style
    fillcolor = attrs.fillcolor or attrs.color
  else
    fillcolor = attrs.fillcolor
  if fillcolor
    styles.push "fill: #{fillcolor};"
  if attrs.color?
    styles.push "stroke: #{attrs.color};"

  styles.join('; ') or undefined

text_style = () ->
  1

attach_self = (list, self) ->
  {key: l, self: self} for l in list
