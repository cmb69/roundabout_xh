<?php

function json_encode($value)
{
    switch (gettype($value)) {
    case 'boolean':
        return $value ? 'true' : 'false';
    case 'integer':
    case 'double':
        return $value;
    case 'string':
        $value = addcslashes($value, "\"\\");
        return '"' . preg_replace('/[\x00-\x1f]/s', '\u00$1', $value) . '"';
    case 'array':
        if (array_keys($value) === range(0, count($value) - 1)) {
            $elts = array();
            foreach ($value as $val) {
                $elts[] = json_encode($val);
            }
            return '[' . implode(',', $elts) . ']';
        } else {
            $members = array();
            foreach ($value as $key => $val) {
                $members[] = '"' . $key . '":' . json_encode($val);
            }
            return '{' . implode(',', $members) . '}';
        }
    case 'object':
        return json_encode(get_object_vars($value));
    case 'NULL':
        return 'null';
    case 'resource':
    default:
        trigger_error('json_encode(): type is unsupported, encoded as null',
                      E_USER_WARNING);
        return null;
    }
}

?>
