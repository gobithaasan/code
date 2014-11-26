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

  printf("\n\n\n");
  char * vbar = "\u2502";
  for (size_t i = 0; i < strlen(vbar); i++)
    printf("%c\n", vbar[i]);

  /****************************************************************************/
  /* CLEAN UP                                                                 */
  /****************************************************************************/
  fclose(req_file);
  exit(EXIT_SUCCESS);
}


