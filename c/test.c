#include <time.h>
#include <stdint.h>
#include "lib/list.h"

// #define COUNT 100000
#define TYPE uint64_t
#define FMT "%lu"

void print(data_t head) {
  printf(FMT" ", *(TYPE*)head);
}

void * plus(void * acc, data_t head) {
  *(TYPE*)acc += *(TYPE*)head;
  return acc;
}

bool lt(data_t head1, data_t head2) { return *(TYPE*)head1 < *(TYPE*)head2; }

#define TIMING(action, label) do {                              \
  start = clock();                                              \
  action;                                                       \
  diff = clock() - start;                                       \
  msec = (double)diff * 1000.0 / (double)CLOCKS_PER_SEC;        \
  printf("%s = %f\n", label, msec/1000.0);                      \
  } while (0);

int main(int argc, char *argv[]) {
  clock_t start, diff;
  double msec;
  TYPE * array;
  list_t * list, * sorted;
  uint64_t COUNT = atol(argv[1]);
  
  printf("array size = %lu\n", sizeof(TYPE) * COUNT);
  printf("list size = %lu\n", sizeof(list_t) * COUNT);
  
  TIMING(array = malloc(sizeof(TYPE) * COUNT);
         assert(array != NULL);
         for (TYPE i = 0; i < COUNT; i++) {
           array[i] = rand() % COUNT;
         },"fill array time");


  TIMING(list = list_fromarray(array, sizeof(TYPE), COUNT);, "fill list time");

  TYPE total = 0;

  TIMING(total = *(TYPE*)list_fold(list, &total, plus);, "fold time");

  TIMING(sorted = list_sort(list, lt);, "sort time");

  total = 0;
  TIMING(total = *(TYPE*)list_fold(sorted, &total, plus);, "sorted fold time");

  free(array);
  free(list);
  return 0;
}
