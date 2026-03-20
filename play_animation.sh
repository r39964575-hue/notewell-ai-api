#!/bin/bash
# Simple animation player
clear
while read -r line; do
    echo "$line"
    sleep 0.1
done < ascii_animation.txt
