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
/* UNICODE CHARACTERS FOR TREE DRAWING                                        */
/******************************************************************************/

#define B_HR "\u2500"  // horizontal bar
#define B_TL "\u250C"  // top-left box corner
#define B_TR "\u2510"  // top-right box corner
#define B_BL "\u2514"  // bottom-left box corner
#define B_BR "\u2518"  // bottom-right box corner
#define B_VT "\u2502"  // vertical bar

/******************************************************************************/
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define MAX(a, b) ((a) > (b) ? (a) : (b))

static inline void tline(size_t width, size_t pad) {
  for (size_t i = 0; i < pad; i++)
    printf(" ");
  printf("%s", B_TL);
  for (size_t i = 0; i < width-2; i++)
    printf("%s", B_HR);
  printf("%s\n", B_TR);
}

static inline void bline(size_t width, size_t pad) {
  for (size_t i = 0; i < pad; i++)
    printf(" ");
  printf("%s", B_BL);
  for (size_t i = 0; i < width-2; i++)
    printf("%s", B_HR);
  printf("%s\n", B_BR);
}

static inline void print_boxed(const char * label, size_t width, size_t pad) {
  char label_str[86];
  size_t inspadl = (width-strlen(label)-2) / 2;
  size_t inspadr = inspadl + (width-strlen(label)-2) % 2;
  printf("inspadl = %lu\n", inspadl);
  printf("inspadr = %lu\n", inspadr);
  size_t i = 0;
  for (size_t j = 0; j < pad; j++)
    label_str[i++] = ' ';
  label_str[i++] = 0xe2;
  label_str[i++] = 0x94;
  label_str[i++] = 0x82;
  for (size_t j = 0; j < inspadl; j++)
    label_str[i++] = '*';
  for (size_t j = 0; j < strlen(label); j++)
    label_str[i++] = label[j];
  for (size_t j = 0; j < inspadr; j++)
    label_str[i++] = '*';
  label_str[i++] = 0xe2;
  label_str[i++] = 0x94;
  label_str[i++] = 0x82;
  label_str[i++] = '\n';
  label_str[i++] = '\0';
  tline(width, pad);
  printf("%s", label_str);
  bline(width, pad);
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
  print_boxed("MEM_CONFIG", 40, 2);
  printf("MAX_POOL_SIZE_BYTES = %lu\n", MAX_POOL_SIZE_BYTES);
  printf("MIN_ALLOC_BYTES     = %lu\n", MIN_ALLOC_BYTES);
  printf("MAX_POOL_SIZE_WORDS = %lu\n", MAX_POOL_SIZE_WORDS);
  printf("MIN_ALLOC_WORDS     = %lu\n", MIN_ALLOC_WORDS);
}
