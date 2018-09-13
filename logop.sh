awk -F: '/buckets/ {
            count[$1]["buckets"]++
         }
         /layers/ {
            count[$1]["layers"]++
         } END {
            printf("%-15s %9s %9s\n","date-time","buckets","layers")
            n=asorti(count,sorted)
            chunk_size=134217600/(1024*1024*1024)
            for(i=1;i<=n;i++){
                bucket_sum += count[sorted[i]]["buckets"]
                layer_sum += count[sorted[i]]["layers"]
                printf("%-14s %9d %9d \n",sorted[i],count[sorted[i]]["buckets"],count[sorted[i]]["layers"])
            }
            printf("%-14s %9d %9d \n","total",bucket_sum,layer_sum)
         }' httpd.log
