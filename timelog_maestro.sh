#!/bin/bash

# กำหนดจำนวนรอบและไฟล์ Log
LOOPS=100
MONITOR_INTERVAL=5  # ระยะเวลาในการเก็บข้อมูลทุกๆ 5 วินาที
LOG_FILE="$HOME/process_log_maestro.txt"

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

# Loop การรัน
for ((i=1; i<=LOOPS; i++)); do
    echo "============================" >> $LOG_FILE
    echo "=== Running loop #$i ===" >> $LOG_FILE
    echo "============================" >> $LOG_FILE

    echo "[$(date)] Starting loop #$i..."

    # เริ่มการมอนิเตอร์ในพื้นหลัง
    monitor_system &
    MONITOR_PID=$!

    # รันคำสั่ง maestro test
    echo "[Command] maestro test --debug-output ./test-output flow_test.yml"
    maestro test --debug-output /Users/siriram.h/Documents/maestreo/test-output /Users/siriram.h/Documents/maestreo/flow_test.yml

    # หยุดการมอนิเตอร์
    kill $MONITOR_PID
    wait $MONITOR_PID 2>/dev/null

    echo "Completed loop #$i at $(date)"
    sleep 3
done

echo "Stability test completed: $(date)" >> $LOG_FILE