// mem.c

#include "../lib/mem.h"

/******************************************************************************/
/* GLOBAL DEFINITIONS                                                         */
/******************************************************************************/
list_t *     memory_block_list = NULL;
void *       memory_pool[MAX_POOL_SIZE_WORDS];
req_status_t req_history[MAX_HISTORY_LENGTH];
policy_t     policy;
bytes_t      pool_size;

/******************************************************************************/
static inline void hline() {
  printf("/");
  for (int i = 0; i < 78; i++)
    printf("*");
  printf("/");
}

void print_usage(char * name) {
  printf("error reading arguments\n");
  printf("usage:\n");
  printf("%s ", name);
  printf("[policy:(first|best|buddy)] ");
  printf("[pool_size:int] ");
  printf("[req_file:string]\n");
}

/* Debugging info */
void print_mem_config() {
  printf("MAX_POOL_SIZE_BYTES = %lu\n", MAX_POOL_SIZE_BYTES);
  printf("MIN_ALLOC_BYTES     = %lu\n", MIN_ALLOC_BYTES);
  printf("MAX_POOL_SIZE_WORDS = %lu\n", MAX_POOL_SIZE_WORDS);
  printf("MIN_ALLOC_WORDS     = %lu\n", MIN_ALLOC_WORDS);
}
