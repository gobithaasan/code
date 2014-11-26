// mem.h

#ifndef LIB_MEM_H_
#define LIB_MEM_H_

#include <string.h>
#include "./list.h"
#include "./io.h"

/******************************************************************************/
/* CONFIG OPTIONS                                                             */
/******************************************************************************/
#define MAX_POOL_SIZE_KBYTES  (1024ul)
#define MIN_ALLOC_BYTES       (32ul)
#define MAX_HISTORY_LENGTH    (1000ul)

#define BYTES_TO_WORDS(bytes) (bytes / WORD_SIZE_BYTES)
#define WORDS_TO_BYTES(words) (words * WORD_SIZE_BYTES)

/******************************************************************************/
#define MAX_POOL_SIZE_BYTES   (1024ul * MAX_POOL_SIZE_KBYTES)
#define WORD_SIZE_BYTES       (sizeof(void *))
#define MAX_POOL_SIZE_WORDS   BYTES_TO_WORDS(MAX_POOL_SIZE_BYTES)
#define MIN_ALLOC_WORDS       BYTES_TO_WORDS(MIN_ALLOC_BYTES)

/******************************************************************************/
/* TYPES                                                                      */
/******************************************************************************/

/* Policies */
typedef enum {
  FIRST_FIT,
  BEST_FIT,
  BUDDY_SYSTEM
} policy_t;

const char * policy_names[] = {
  [FIRST_FIT]    = "FIRST_FIT",
  [BEST_FIT]     = "BEST_FIT",
  [BUDDY_SYSTEM] = "BUDDY_SYSTEM"
};

/* Requests */
typedef enum {
  ALLOC,
  FREE,
  NONE
} req_t;

const char * req_type_names[] = {
  [ALLOC] = "ALLOC",
  [FREE]  = "FREE",
  [NONE]  = "NONE"
};

/* Type aliases to keep track of units */
typedef size_t bytes_t;
typedef size_t words_t;

/* Results of a memory management request */
typedef struct req_status_s {
  int     req_id;
  req_t   req_type;
  bytes_t req_size;
  bool    req_granted;
  void *  req_addr;
  words_t total_free;
  words_t max_free;
  size_t  blocks_free;
  size_t  blocks_alloc;
} req_status_t;

/* Data for block list nodes */
#define NOBODY (0)
typedef struct mem_block_s {
  int      id;
  bool     is_free;
  void   * addr;
  words_t  size;
  list_t * prev;
  list_t * curr;
} mem_block_t;

/* Return value of reading a request from file */
typedef struct request_s {
  int     id;
  req_t   type;
  bytes_t size;
  int     ref;
} request_t;

/******************************************************************************/
/* GLOBALS                                                                    */
/******************************************************************************/
extern list_t *     memory_block_list;  // elements have type mem_block_t*
extern void *       memory_pool[];
extern req_status_t req_history[];      // for printing output
extern policy_t     policy;
extern bytes_t      pool_size;

/******************************************************************************/
request_t *   load_request(FILE * file);
mem_block_t * first_free(bytes_t size);
mem_block_t * best_free(bytes_t size);

/******************************************************************************/
void process_request(request_t request);
void print_usage(char * name);
void print_mem_config();
void print_output(int from, int to);

#endif  // LIB_MEM_H_
