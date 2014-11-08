#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <limits.h>
#include "lib/user_input.h"
#include "lib/list.h"
#include "lib/hash.h"
#include "lib/util.h"



/* GLOBAL VARIABLES */
char countries[NUMC][BUFSIZ];
char alternate[NUMA][BUFSIZ];
char questions[NUMQ][BUFSIZ];
bool q_answers[NUMC][NUMQ];

int main(int argc, char * argv[]) {
  hash_table_t * hash_table;

  load_text("data/countries.csv", NUMC, countries);
  hash_table = load_alternates(HTSZ, alternate);

  printf("Enter country name: ");
  char * str = lowercase(get_input_string());
  char * correct = match_str(str, hash_table, alternate);

  return 0;
}

#undef MIN
