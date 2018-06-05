#!/usr/bin/python

# -*- coding: utf-8 -*-

import sys
sys.path.insert(0, '/usr/lib/cgi-bin')

import psycopg2
from psycopg2 import sql
import json
import collections
import cgi, cgitb
from datetime import datetime, timedelta
import calendar
import logging
import connessione
cgitb.enable()

parametri = connessione.Parametri()

host = parametri.host
user = parametri.user
password = parametri.password
dbname = parametri.dbname

def checkCodareaallerta(codareaallerta) :
    dict = {
        "A1": 1,
        "A6": 2,
        "A3": 3,
        "A2": 4,
        "B": 5,
        "E1": 6,
        "E2": 7,
        "E3": 8,
        "F1": 9,
        "F2": 10,
        "I": 11,
        "L": 12,
        "M": 13,
        "O1": 14,
        "O3": 15,
        "O2": 16,
        "R1": 17,
        "R2": 18,
        "S3": 19,
        "S1": 20,
        "S2": 21,
        "A4": 22,
        "A5": 23,
        "C": 24,
        "T": 25,
        "V": 26
    }
    return dict.get(codareaallerta)

def checkCodallerta(codallerta) :
    dict = {
        1: "idrogeologico",
        2: "idraulico",
        3: "vento",
        4: "mareggiate",
        5: "neve",
        6: "ghiaccio",
        7: "temporali"
    }
    return dict.get(codallerta)

def checkCodimpatto(codimpatto) :
    dict = {
        1: "nessuno",
        2: "basso",
        3: "medio",
        4: "alto",
        None: None
    }
    return dict.get(codimpatto)


def fetchAreeAllertaData(conn, form):

    #print "Content-type: text/plain\r\n\r\n"
    #sys.exit(0)

    cur1 = conn.cursor()
    cur10 = conn.cursor()

    ssigla = form.getvalue('ssigla')
    fromData = form.getvalue('fromData')
    toData = form.getvalue('toData')
    impatto = form.getvalue('impatto').split(',')
    codallerta = form.getvalue('codallerta').split(',')
    draw = form.getvalue('draw')
    tipoimpatto = 'impatto_24' if form.getvalue('tipoimpatto') == '24' else 'impatto_48'

    a = collections.OrderedDict()
    objects_list = []

    statsArea = sql.SQL("""
        SELECT
            gid,
            ssigla,
            sdescr,
            data,
            codallerta,
            codareaallerta,
            impatto_24,
            impatto_48
        FROM
            spaz.aree_allerta,
            spaz.allertameteo
        WHERE
            spaz.aree_allerta.gid = spaz.allertameteo.codareaallerta
        AND
            data BETWEEN date %s AND date %s
        AND
            ssigla = %s
        AND
            codallerta IN %s
        AND
            {} IN %s
        ORDER BY data;""").format(sql.Identifier(tipoimpatto))

    data = (fromData, toData, ssigla, tuple(codallerta), tuple(impatto), )
    cur1.execute(statsArea, data)
    rows1 = cur1.fetchall()

    conteggio_imp24 = collections.OrderedDict()
    conteggio_imp48 = collections.OrderedDict()

    countImpatti = sql.SQL("""
        SELECT
            codimpatto,
            count(codimpatto)
        FROM (
            SELECT
                data,
                max({}) AS codimpatto
            FROM
                spaz.allertameteo
            WHERE
                data BETWEEN date %s AND date %s AND codareaallerta=%s
            GROUP BY data
        ) AS foo
        GROUP BY codimpatto;""").format(sql.Identifier(tipoimpatto))

    data1 = (fromData, toData, str(checkCodareaallerta(ssigla)))

    cur10.execute(countImpatti, data1)

    rows10 = cur10.fetchall()

    conteggio_imp24['totale'] = 0
    conteggio_imp24['nessuno'] = 0
    conteggio_imp24['basso'] = 0
    conteggio_imp24['medio'] = 0
    conteggio_imp24['alto'] = 0

    for row10 in rows10:
        if row10[0] == 1:
            conteggio_imp24['nessuno'] = row10[1]
            conteggio_imp24['totale'] += row10[1]
        elif row10[0] == 2:
            conteggio_imp24['basso'] = row10[1]
            conteggio_imp24['totale'] += row10[1]
        elif row10[0] == 3:
            conteggio_imp24['medio'] = row10[1]
            conteggio_imp24['totale'] += row10[1]
        else:
            conteggio_imp24['alto'] = row10[1]
            conteggio_imp24['totale'] += row10[1]

    for row in rows1:

        d = collections.OrderedDict()
        imp24 = collections.OrderedDict()
        imp48 = collections.OrderedDict()

        imp24['val'] = int(row[6]) if row[6] else None
        imp24['desc'] = checkCodimpatto(int(row[6]) if row[6] else None)
        imp48['val'] = int(row[7]) if row[7] else None
        imp48['desc'] = checkCodimpatto(int(row[7]) if row[7] else None)

        d['id'] = row[0]
        d['ssigla'] = row[1]
        d['sdescr'] = row[2]
        d['data'] = str(row[3])
        d['timestamp'] = calendar.timegm(datetime.strptime(str(row[3]), '%Y-%m-%d').utctimetuple()) * 1000
        d['codallerta'] = checkCodallerta(int(row[4]))
        d['impatto_24'] = imp24
        d['impatto_48'] = imp48

        objects_list.append(d)

    a['draw'] = int(draw) if draw else draw
    a['recordsTotal'] = len(rows1)
    a['total'] = len(rows1)
    a['recordsFiltered'] = len(rows1)

    a['conteggio_impatto24'] = conteggio_imp24

    a['data'] = objects_list
    a['rows'] = objects_list

    print "Content-type: application/json"
    print "Access-Control-Allow-Origin: *"
    print "Access-Control-Allow-Headers: X-Requested-With"
    print

    print(json.dumps(a))

    sys.exit(0)

try:
    myConnection = psycopg2.connect(host=host, user=user, password=password, dbname=dbname)
except:
    print "I am unable to connect to the database"

form = cgi.FieldStorage()

fetchAreeAllertaData(myConnection ,form)
myConnection.close()
