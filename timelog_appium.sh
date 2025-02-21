#!/bin/bash

# กำหนดจำนวนรอบและไฟล์ Log
LOOPS=100
MONITOR_INTERVAL=5  # ระยะเวลาในการเก็บข้อมูลทุกๆ 5 วินาที
LOG_FILE="$HOME/process_log_appium.txt"

# เคลียร์ไฟล์ Log ก่อนเริ่ม
echo "Start stability test: $(date)" > $LOG_FILE

# ฟังก์ชันเก็บข้อมูล System metrics
get_system_metrics() {
    CPU_USAGE=$(top -l 1 | grep "CPU usage" | awk '{print $3, $4, $5}')
    PHYS_MEM=$(top -l 1 | grep "PhysMem" | awk '{printf "Used: %s, Wired: %s, Free: %s", $2, $4, $6}')
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] CPU: $CPU_USAGE | RAM: $PHYS_MEM" >> "$LOG_FILE"
}

# ฟังก์ชันมอนิเตอร์ระบบ
monitor_system() {
    while true; do
        get_system_metrics
        sleep $MONITOR_INTERVAL
    done
}

# ฟังก์ชันแสดง Spinner ระหว่างคำสั่งรัน
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Loop การรัน
for ((i=1; i<=LOOPS; i++)); do
    echo "============================" >> $LOG_FILE
    echo "=== Running loop #$i ===" >> $LOG_FILE
    echo "============================" >> $LOG_FILE

    echo "[$(date)] Starting loop #$i..."

    # เริ่มการมอนิเตอร์ในพื้นหลัง
    monitor_system &
    MONITOR_PID=$!

    # รันคำสั่ง node test พร้อมแสดง Spinner
    echo "[Command] node test/e2e/e2e_token.js"
    node /Users/siriram.h/Documents/appium_test/test/e2e/e2e_token.js &
    TEST_PID=$!
    spinner $TEST_PID
    wait $TEST_PID

    # หยุดการมอนิเตอร์
    kill $MONITOR_PID
    wait $MONITOR_PID 2>/dev/null

    echo "Completed loop #$i at $(date)"
    sleep 3
done

echo "Stability test completed: $(date)" >> $LOG_FILE