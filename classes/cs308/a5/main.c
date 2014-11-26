// main.c

#include <limits.h>
#include "lib/mem.h"

int main(int argc, char *argv[]) {
  /****************************************************************************/
  /* READ COMMAND LINE ARGUMENTS                                              */
  /****************************************************************************/
  if (argc != 4) {
    print_usage(argv[0]);
    exit(EXIT_FAILURE);
  }  // end if (argc != 4)

  FILE * req_file;

  /* get policy */
  if (strcmp(argv[1], "first") == 0) {
    policy = FIRST_FIT;
  } else if (strcmp(argv[1], "best") == 0) {
    policy = BEST_FIT;
  } else if (strcmp(argv[1], "buddy") == 0) {
    policy = BUDDY_SYSTEM;
  } else {  // unknown policy name
    print_usage(argv[0]);
    exit(EXIT_FAILURE);
  }  // end if (strcmp(argv[1], "first") == 0)

  /* get pool size */
  if (!atoi(argv[2])) {
    printf("error: the pool size must be a positive integer\n");
    exit(EXIT_FAILURE);
  } else {  // given pool size is greater than 0
    pool_size = atoi(argv[2]);
  }  // end if (!atoi(argv[2]))

  /* open requests file for reading */
  req_file = fopen(argv[3], "r");

  /****************************************************************************/
  /* SETUP MEMORY POOL                                                        */
  /****************************************************************************/
  print_mem_config();

  mem_block_t init_block;
  init_block.id      = NOBODY;
  init_block.is_free = true;
  init_block.addr    = memory_pool;
  init_block.size    = BYTES_TO_WORDS(pool_size);
  memory_block_list  = list_pre(NULL, &init_block);

  req_status_t init_req_status;
  init_req_status.req_id       = init_block.id;
  init_req_status.req_type     = NONE;
  init_req_status.req_size     = 0;
  init_req_status.req_granted  = true;
  init_req_status.total_free   = init_block.size;
  init_req_status.max_free     = init_block.size;
  init_req_status.blocks_free  = 1;
  init_req_status.blocks_alloc = 0;
  req_history[0]               = init_req_status;

  /****************************************************************************/
  /* CLEAN UP                                                                 */
  /****************************************************************************/
  fclose(req_file);
  exit(EXIT_SUCCESS);
}


