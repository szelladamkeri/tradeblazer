<script setup lang="ts">
//import TheWelcome from '../components/TheWelcome.vue'
import PageHeader from '../components/PageHeader.vue';
import PageMain from '../components/PageMain.vue';
</script>

<template>

    <!-- <PageHeader :link-count="3" class="">
    </PageHeader>
    <PageMain class="">
        <div class="w-[75%] ml-[7.2rem] h-[80%] bg-black bg-opacity-70 backdrop-blur-xl 
                    absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    flex items-center justify-center">
            <div class="">

            </div>
        </div>
    </PageMain> -->

    <div class=" w-full h-full">

        <PageHeader :link-count="3" class=""></PageHeader>
        <PageMain></PageMain>

        <!-- <PageMain class="flex-grow bg-black bg-opacity-70 backdrop-blur-xl">
            <div class="w-full h-full flex items-center justify-center">
                <div class="text-white">
                    Content
                </div>
            </div>
        </PageMain> -->
    </div>

</template>

<style>
main {
    position: relative;
}

#trending {}
</style>
